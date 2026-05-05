import type { NextFunction, Request, Response } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

const register = new Registry();

register.setDefaultLabels({
  app: "cryptohub-backend",
});

collectDefaultMetrics({
  prefix: "cryptohub_backend_",
  register,
});

type HttpMetricLabels = "method" | "route" | "status_code";

const httpRequestsTotal = new Counter<HttpMetricLabels>({
  name: "cryptohub_backend_http_requests_total",
  help: "Total number of HTTP requests handled by the Express server",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDurationSeconds = new Histogram<HttpMetricLabels>({
  name: "cryptohub_backend_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const httpRequestsInFlight = new Gauge({
  name: "cryptohub_backend_http_requests_in_flight",
  help: "Current number of in-flight HTTP requests",
  registers: [register],
});

const getRouteLabel = (req: Request) => {
  if (req.path === "/metrics") {
    return "/metrics";
  }

  const route = req.route as { path?: unknown } | undefined;
  const routePath = typeof route?.path === "string" ? route.path : undefined;

  if (routePath) {
    return `${req.baseUrl}${routePath}` || "/";
  }

  return req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
};

export const prometheusMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path === "/metrics") {
    return next();
  }

  httpRequestsInFlight.inc();

  const startedAt = process.hrtime.bigint();
  let metricsRecorded = false;

  const recordMetrics = (statusCode: number) => {
    if (metricsRecorded) {
      return;
    }

    metricsRecorded = true;
    httpRequestsInFlight.dec();

    const durationSeconds =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

    const labels = {
      method: req.method,
      route: getRouteLabel(req),
      status_code: String(statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  };

  res.once("finish", () => {
    recordMetrics(res.statusCode);
  });

  res.once("close", () => {
    if (!res.writableEnded) {
      recordMetrics(499);
    }
  });

  return next();
};

export const metricsHandler = async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
};

export { register as prometheusRegistry };

import type { NextFunction, Request, Response } from "express";

import { APP_ROUTES } from "@/constants/routes.js";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path === APP_ROUTES.metrics) {
    return next();
  }

  const startedAt = process.hrtime.bigint();

  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    req.log.info({
      type: "http_request",
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    });
  });

  next();
};

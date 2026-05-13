import { toNodeHandler } from "better-auth/node";
import express from "express";

import { auth } from "@/libs/auth.js";
import { errorHandler } from "@/middleware/errorHandler.js";

import { corsMiddleware } from "./middleware/corsMiddleware.js";
import { requestContext } from "./middleware/requestContext.js";
import { requestLogger } from "./middleware/requestLogger.js";
import healthRouter from "./modules/health/health.route.js";
import {
  metricsHandler,
  prometheusMiddleware,
} from "./monitoring/prometheus.js";
import openApiRouter from "./openapi/openapi.route.js";
import router from "./routes/index.route.js";

const app = express();

app.use(corsMiddleware);
app.use(requestContext);
app.use(prometheusMiddleware);
app.use(requestLogger);

app.get("/metrics", metricsHandler);
app.use("/health", healthRouter);
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/docs", openApiRouter);
app.use("/api", router);

app.use(errorHandler);

export default app;

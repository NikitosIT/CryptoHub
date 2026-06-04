import express from "express";

import { APP_ROUTES } from "@/constants/routes.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import { bullBoardRouter } from "@/monitoring/bull-board.js";

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

app.get(APP_ROUTES.metrics, metricsHandler);
app.use(APP_ROUTES.health, healthRouter);

app.use(express.json());

app.use(APP_ROUTES.docs, openApiRouter);
app.use(APP_ROUTES.adminQueues, bullBoardRouter);
app.use(APP_ROUTES.api, router);

app.use(errorHandler);

export default app;

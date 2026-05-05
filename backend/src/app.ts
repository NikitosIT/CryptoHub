import express from "express";

import { errorHandler } from "@/middleware/errorHandler.js";

import { corsMiddleware } from "./middleware/corsMiddleware.js";
import { requestContext } from "./middleware/requestContext.js";
import { requestLogger } from "./middleware/requestLogger.js";
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

app.use(express.json());

app.use("/docs", openApiRouter);
app.use("/api", router);

app.use(errorHandler);

export default app;

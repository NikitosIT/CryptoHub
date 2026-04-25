import express from "express";

import { corsMiddleware } from "./middleware/corsMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import {
  metricsHandler,
  prometheusMiddleware,
} from "./monitoring/prometheus.js";
import router from "./routes/index.route.js";

const app = express();

app.use(corsMiddleware);
app.use(prometheusMiddleware);
app.use(requestLogger);

app.get("/metrics", metricsHandler);

app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

export default app;

//Todos:
// - Abort controller
// - Rate limit

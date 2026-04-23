import express from "express";

import { corsMiddleware } from "./shared/middleware/corsMiddleware.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import router from "./shared/routes/index.route.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

export default app;

//Todos:
// - Abort controller
// - Rate limit

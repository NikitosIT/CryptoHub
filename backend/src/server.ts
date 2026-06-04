import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./libs/db.js";
import { logger } from "./libs/logger.js";
import { connectAppRedis } from "./libs/redis.js";
import { setupTerminus } from "./terminus.js";

const startServer = async () => {
  try {
    await connectDB();
    await connectAppRedis();

    const server = createServer(app);

    setupTerminus(server);

    server.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT },
        `Server running on http://localhost:${env.PORT}`,
      );
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

process.on("uncaughtException", (err: unknown) => {
  logger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (err: unknown) => {
  logger.fatal({ err }, "Unhandled Promise Rejection");
  process.exit(1);
});

void startServer();

import "dotenv/config";

import app from "./app.js";
import { connectDB, disconnectDB } from "./libs/db.js";
import { logger } from "./libs/logger.js";
import { connectRedis, disconnectRedis } from "./libs/redis.js";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      try {
        logger.info({ signal }, "Received shutdown signal");

        server.close(() => {
          void (async () => {
            try {
              await disconnectDB();
              await disconnectRedis();
              logger.info("HTTP server closed");
              process.exit(0);
            } catch (error) {
              logger.error({ err: error }, "Shutdown error");
              process.exit(1);
            }
          })();
        });
      } catch (error) {
        logger.error({ err: error }, "Failed to shut down cleanly");
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
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

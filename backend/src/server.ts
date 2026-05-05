import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./libs/db.js";
import { logger } from "./libs/logger.js";
import { connectRedis } from "./libs/redis.js";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`);
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

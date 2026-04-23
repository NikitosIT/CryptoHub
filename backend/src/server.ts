import "dotenv/config";

import app from "./app.js";
import { connectDB, disconnectDB } from "./shared/libs/db.js";
import { connectRedis, disconnectRedis } from "./shared/libs/redis.js";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      try {
        console.log(`Received ${signal}. Shutting down...`);

        server.close(() => {
          void (async () => {
            try {
              await disconnectDB();
              await disconnectRedis();
              console.log("HTTP server closed");
              process.exit(0);
            } catch (error) {
              console.error("Shutdown error:", error);
              process.exit(1);
            }
          })();
        });
      } catch (error) {
        console.error("Failed to shut down cleanly:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (err: unknown) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err: unknown) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

void startServer();

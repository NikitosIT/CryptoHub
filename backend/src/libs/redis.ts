import { createClient } from "redis";

import { logger } from "@/libs/logger.js";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
    logger.info("Redis connected");
  }
};

export const disconnectRedis = async () => {
  if (redis.isOpen) {
    await redis.quit();
    logger.info("Redis disconnected");
  }
};

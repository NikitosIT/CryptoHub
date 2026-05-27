import { createClient } from "redis";

import { env } from "@/config/env.js";
import { logger } from "@/libs/logger.js";

export const appRedis = createClient({
  url: env.REDIS_URL,
});

appRedis.on("error", (err) => {
  logger.error({ err }, "App Redis error");
});

export const connectAppRedis = async () => {
  if (!appRedis.isOpen) {
    await appRedis.connect();
    logger.info("App Redis connected");
  }
};

export const disconnectAppRedis = async () => {
  if (appRedis.isOpen) {
    await appRedis.quit();
    logger.info("App Redis disconnected");
  }
};

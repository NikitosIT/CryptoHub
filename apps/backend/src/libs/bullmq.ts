import { Redis } from "ioredis";

import { env } from "@/config/env.js";
import { logger } from "@/libs/logger.js";

export const bullmqConnection = new Redis(env.BULLMQ_REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

bullmqConnection.on("error", (err) => {
  logger.error({ err }, "BullMQ Redis error");
});

export const connectBullmq = async () => {
  if (bullmqConnection.status === "wait") {
    await bullmqConnection.connect();
    logger.info("BullMQ Redis connected");
  }
};

export const disconnectBullmq = async () => {
  if (bullmqConnection.status === "end") {
    return;
  }

  try {
    await bullmqConnection.quit();
  } catch {
    bullmqConnection.disconnect();
  }

  logger.info("BullMQ Redis disconnected");
};

import type { Server } from "node:http";

import { createTerminus } from "@godaddy/terminus";

import { disconnectDB } from "@/libs/db.js";
import { logger } from "@/libs/logger.js";
import { disconnectRedis } from "@/libs/redis.js";

const onSignal = async (): Promise<void> => {
  logger.info("Terminus shutdown signal received, closing dependencies");

  await Promise.all([disconnectDB(), disconnectRedis()]);
};

const beforeShutdown = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1_000);
  });
};

const onShutdown = (): Promise<void> => {
  logger.info("Terminus finished graceful shutdown");
  return Promise.resolve();
};

const logTerminusError = (message: string, error: Error): void => {
  logger.error({ err: error }, message);
};

export const setupTerminus = (server: Server): Server =>
  createTerminus(server, {
    signals: ["SIGINT", "SIGTERM"],
    timeout: 10_000,
    sendFailuresDuringShutdown: true,
    logger: logTerminusError,
    beforeShutdown,
    onSignal,
    onShutdown,
  });

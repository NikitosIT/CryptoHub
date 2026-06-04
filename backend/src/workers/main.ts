import "dotenv/config";

import type { Worker } from "bullmq";

import { connectBullmq, disconnectBullmq } from "@/libs/bullmq.js";
import { connectDB, disconnectDB } from "@/libs/db.js";
import { logger } from "@/libs/logger.js";
import { connectAppRedis, disconnectAppRedis } from "@/libs/redis.js";

import { startWorkers, stopWorkers } from "./index.js";

let workers: Worker[] = [];

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`Worker shutdown signal received: ${signal}`);

  try {
    await stopWorkers(workers);
    await Promise.all([
      disconnectDB(),
      disconnectAppRedis(),
      disconnectBullmq(),
    ]);
    process.exit(0);
  } catch (error) {
    console.error("Worker shutdown failed:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

async function startWorkerProcess() {
  try {
    await connectDB();
    await connectAppRedis();
    await connectBullmq();

    workers = startWorkers();

    logger.info("Workers started");
  } catch (error) {
    logger.error({ err: error }, "Failed to start workers");
    process.exit(1);
  }
}

void startWorkerProcess();

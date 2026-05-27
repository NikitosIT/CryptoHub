import { startWorkers, stopWorkers } from "./index.js";

const workers = startWorkers();

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`Worker shutdown signal received: ${signal}`);

  try {
    await stopWorkers(workers);
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

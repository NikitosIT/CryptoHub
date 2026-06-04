import "dotenv/config";

import { connectBullmq, disconnectBullmq } from "@/libs/bullmq.js";
import { logger } from "@/libs/logger.js";

import { removeWeeklyCryptotokenSnapshotScheduler } from "../snapshots.enqueue.js";

const main = async () => {
  await connectBullmq();

  const removed = await removeWeeklyCryptotokenSnapshotScheduler();

  logger.info(
    {
      removed,
    },
    "Cryptotoken snapshots cron scheduler removed",
  );
};

try {
  await main();
} finally {
  await disconnectBullmq();
}

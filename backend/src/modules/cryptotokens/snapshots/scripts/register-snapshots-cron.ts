import "dotenv/config";

import { connectBullmq, disconnectBullmq } from "@/libs/bullmq.js";
import { logger } from "@/libs/logger.js";

import { upsertCreateWeeklyCryptotokenSnapshotScheduler } from "../snapshots.enqueue.js";

const main = async () => {
  await connectBullmq();

  const job = await upsertCreateWeeklyCryptotokenSnapshotScheduler({
    pattern: "0 0 * * 1",
  });

  logger.info(
    {
      jobId: job.id,
      queue: job.queueName,
      jobName: job.name,
    },
    "Cryptotoken snapshots cron scheduler registered",
  );
};

try {
  await main();
} finally {
  await disconnectBullmq();
}

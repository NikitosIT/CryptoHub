import "dotenv/config";

import { logger } from "@/libs/logger.js";
import { connectBullmq, disconnectBullmq } from "@/redis/bullmq.js";

import { upsertRefreshCryptotokenSnapshotsScheduler } from "../snapshots.producer.js";

const main = async () => {
  await connectBullmq();

  const job = await upsertRefreshCryptotokenSnapshotsScheduler({
    every: 60_000,
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

import { BULLMQ } from "@/constants/bullmq.js";
import { logger } from "@/libs/logger.js";

import { upsertCreateWeeklyCryptotokenSnapshotScheduler } from "./cryptotokens.enqueue.js";

export const registerCryptotokenSchedulers = async () => {
  const scheduler = BULLMQ.queues.cryptotokens.schedulers.syncCryptotokens;

  const job = await upsertCreateWeeklyCryptotokenSnapshotScheduler({
    pattern: scheduler.pattern,
  });

  logger.info(
    {
      jobId: job.id,
      queue: job.queueName,
      jobName: job.name,
      pattern: scheduler.pattern,
    },
    "Cryptotoken snapshots scheduler registered",
  );

  return job;
};

import { Worker } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";
import { logger } from "@/libs/logger.js";

import { processCreateWeeklyCryptotokenSnapshotJob } from "./cryptotokens.processor.js";
import type { CreateWeeklyCryptotokenSnapshotResult } from "./cryptotokens.types.js";

export const createCryptotokenSnapshotsWorker = () => {
  const worker = new Worker<void, CreateWeeklyCryptotokenSnapshotResult>(
    BULLMQ.queues.cryptotokens.name,
    async (job) => {
      switch (job.name) {
        case BULLMQ.queues.cryptotokens.jobs.syncCryptotokens.name:
          return processCreateWeeklyCryptotokenSnapshotJob(job);

        default:
          throw new Error(`Unsupported snapshots job: ${job.name}`);
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    },
  );

  worker.on("completed", (job, result) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
        queue: BULLMQ.queues.cryptotokens.name,
        result,
      },
      "Cryptotoken snapshots job completed",
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        queue: BULLMQ.queues.cryptotokens.name,
        err: error,
      },
      "Cryptotoken snapshots job failed",
    );
  });

  return worker;
};

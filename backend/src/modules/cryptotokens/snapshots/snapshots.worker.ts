import { Worker } from "bullmq";

import { logger } from "@/libs/logger.js";
import { bullmqConnection } from "@/redis/bullmq.js";

import {
  CRYPTOTOKEN_SNAPSHOTS_JOB_NAMES,
  CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME,
} from "./snapshots.constants.js";
import { processRefreshCryptotokenSnapshotsJob } from "./snapshots.processor.js";
import type { RefreshCryptotokenSnapshotsJobData } from "./snapshots.types.js";

export const createCryptotokenSnapshotsWorker = () => {
  const worker = new Worker<RefreshCryptotokenSnapshotsJobData>(
    CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case CRYPTOTOKEN_SNAPSHOTS_JOB_NAMES.REFRESH_WEEKLY_SNAPSHOT:
          return processRefreshCryptotokenSnapshotsJob(job);

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
        queue: CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME,
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
        queue: CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME,
        err: error,
      },
      "Cryptotoken snapshots job failed",
    );
  });

  return worker;
};

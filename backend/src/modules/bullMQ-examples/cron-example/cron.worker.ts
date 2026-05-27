import { Worker } from "bullmq";

import { logger } from "@/libs/logger.js";
import { bullmqConnection } from "@/redis/bullmq.js";

import { processPeriodicMessageJob } from "./cron.processor.js";
import {
  CRON_EXAMPLE_JOB_NAMES,
  CRON_EXAMPLE_QUEUE_NAME,
  type CronExampleMessageData,
} from "./cron.types.js";

export const createCronExampleWorker = () => {
  const worker = new Worker<CronExampleMessageData>(
    CRON_EXAMPLE_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case CRON_EXAMPLE_JOB_NAMES.SEND_PERIODIC_MESSAGE:
          return processPeriodicMessageJob(job);

        default:
          throw new Error(`Unsupported cron example job: ${job.name}`);
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 1_000,
      },
    },
  );

  worker.on("completed", (job) => {
    logger.info(
      {
        jobId: job.id,
        jobName: job.name,
        queue: CRON_EXAMPLE_QUEUE_NAME,
      },
      "Cron example job completed",
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        err: error,
        queue: CRON_EXAMPLE_QUEUE_NAME,
      },
      "Cron example job failed",
    );
  });

  return worker;
};

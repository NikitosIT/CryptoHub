import { Worker } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";
import { logger } from "@/libs/logger.js";

import { processPeriodicMessageJob } from "./cron.processor.js";
import type { CronExampleMessageData } from "./cron.types.js";

export const createCronExampleWorker = () => {
  const worker = new Worker<CronExampleMessageData>(
    BULLMQ.cronExample.queueName,
    async (job) => {
      switch (job.name) {
        case BULLMQ.cronExample.jobs.sendPeriodicMessage:
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
        queue: BULLMQ.cronExample.queueName,
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
        queue: BULLMQ.cronExample.queueName,
      },
      "Cron example job failed",
    );
  });

  return worker;
};

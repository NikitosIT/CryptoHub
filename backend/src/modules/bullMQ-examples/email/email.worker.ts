import { Worker } from "bullmq";

import { logger } from "@/libs/logger.js";
import { bullmqConnection } from "@/redis/bullmq.js";

import { processWelcomeEmailJob } from "./email.processor.js";
import { EMAIL_JOB_NAMES } from "./email.producer.js";
import { EMAIL_QUEUE_NAME } from "./email.queue.js";
import type { SendWelcomeEmailData } from "./email.types.js";

// type EmailJobHandler = (job: Job<SendWelcomeEmailName>) => Promise<void>;

// const handlers: Record<string, EmailJobHandler> = {
//   [EMAIL_JOB_NAMES.SEND_WELCOME_EMAIL]: proccesSendEmail,
// };

export function createEmailWorker() {
  const worker = new Worker<SendWelcomeEmailData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case EMAIL_JOB_NAMES.SEND_WELCOME_EMAIL:
          return processWelcomeEmailJob(job);

        default:
          throw new Error("Error");
      }
    },
    {
      connection: bullmqConnection,

      concurrency: 5,

      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        err: error,
      },
      "Job failed",
    );
  });

  return worker;
}

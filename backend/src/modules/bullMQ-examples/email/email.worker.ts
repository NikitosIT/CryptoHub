import { Worker } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";
import { logger } from "@/libs/logger.js";

import { processWelcomeEmailJob } from "./email.processor.js";
import type { SendWelcomeEmailData } from "./email.types.js";

// type EmailJobHandler = (job: Job<SendWelcomeEmailName>) => Promise<void>;

// const handlers: Record<string, EmailJobHandler> = {
//   [EMAIL_JOB_NAMES.SEND_WELCOME_EMAIL]: proccesSendEmail,
// };

export function createEmailWorker() {
  const worker = new Worker<SendWelcomeEmailData>(
    BULLMQ.email.queueName,
    async (job) => {
      switch (job.name) {
        case BULLMQ.email.jobs.sendWelcomeEmail:
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
    logger.info(
      { jobId: job.id, queue: BULLMQ.email.queueName, jobName: job.name },
      "Job completed",
    );
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

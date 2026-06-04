import { Queue } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";

import type { CronExampleMessageData } from "./cron.types.js";

export const cronExampleQueue = new Queue<CronExampleMessageData>(
  BULLMQ.cronExample.queueName,
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1_000,
      },
      removeOnComplete: {
        age: 60 * 60,
        count: 100,
      },
      removeOnFail: {
        age: 24 * 60 * 60,
      },
    },
  },
);

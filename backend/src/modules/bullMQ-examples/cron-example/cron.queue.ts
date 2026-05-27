import { Queue } from "bullmq";

import { bullmqConnection } from "@/redis/bullmq.js";

import {
  CRON_EXAMPLE_QUEUE_NAME,
  type CronExampleMessageData,
} from "./cron.types.js";

export const cronExampleQueue = new Queue<CronExampleMessageData>(
  CRON_EXAMPLE_QUEUE_NAME,
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

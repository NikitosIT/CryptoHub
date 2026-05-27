import { Queue } from "bullmq";

import { bullmqConnection } from "@/redis/bullmq.js";

import type { SendWelcomeEmailData } from "./email.types.js";

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<SendWelcomeEmailData>(EMAIL_QUEUE_NAME, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
    },
  },
});

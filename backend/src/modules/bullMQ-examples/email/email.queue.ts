import { Queue } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";

import type { SendWelcomeEmailData } from "./email.types.js";

export const emailQueue = new Queue<SendWelcomeEmailData>(
  BULLMQ.email.queueName,
  {
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
  },
);

import { Queue } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";
import { bullmqConnection } from "@/libs/bullmq.js";

export const snapshotsQueue = new Queue<void>(BULLMQ.queues.cryptotokens.name, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60,
      count: 20,
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60,
    },
  },
});

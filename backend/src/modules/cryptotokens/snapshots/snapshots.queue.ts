import { Queue } from "bullmq";

import { bullmqConnection } from "@/redis/bullmq.js";

import { CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME } from "./snapshots.constants.js";
import type { RefreshCryptotokenSnapshotsJobData } from "./snapshots.types.js";

export const snapshotsQueue = new Queue<RefreshCryptotokenSnapshotsJobData>(
  CRYPTOTOKEN_SNAPSHOTS_QUEUE_NAME,
  {
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
  },
);

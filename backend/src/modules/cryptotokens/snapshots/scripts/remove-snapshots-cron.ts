import "dotenv/config";

import { logger } from "@/libs/logger.js";
import { connectBullmq, disconnectBullmq } from "@/redis/bullmq.js";

import { removeRefreshCryptotokenSnapshotsScheduler } from "../snapshots.producer.js";

const main = async () => {
  await connectBullmq();

  const removed = await removeRefreshCryptotokenSnapshotsScheduler();

  logger.info(
    {
      removed,
    },
    "Cryptotoken snapshots cron scheduler removed",
  );
};

try {
  await main();
} finally {
  await disconnectBullmq();
}

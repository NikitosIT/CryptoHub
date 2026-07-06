import type { RepeatOptions } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";

import { snapshotsQueue } from "./cryptotokens.queue.js";

export const enqueueCreateWeeklyCryptotokenSnapshotJob = async () => {
  return snapshotsQueue.add(
    BULLMQ.queues.cryptotokens.jobs.syncCryptotokens.name,
  );
};

export const upsertCreateWeeklyCryptotokenSnapshotScheduler = async (
  repeat: Omit<RepeatOptions, "key">,
) => {
  return snapshotsQueue.upsertJobScheduler(
    BULLMQ.queues.cryptotokens.schedulers.syncCryptotokens.id,
    repeat,
    {
      name: BULLMQ.queues.cryptotokens.jobs.syncCryptotokens.name,
    },
  );
};

export const removeWeeklyCryptotokenSnapshotScheduler = async () => {
  return snapshotsQueue.removeJobScheduler(
    BULLMQ.queues.cryptotokens.schedulers.syncCryptotokens.id,
  );
};

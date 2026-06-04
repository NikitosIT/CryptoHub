import type { RepeatOptions } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";

import { snapshotsQueue } from "./snapshots.queue.js";

export const enqueueCreateWeeklyCryptotokenSnapshotJob = async () => {
  return snapshotsQueue.add(BULLMQ.snapshots.jobs.createWeeklySnapshot);
};

export const upsertCreateWeeklyCryptotokenSnapshotScheduler = async (
  repeat: Omit<RepeatOptions, "key">,
) => {
  return snapshotsQueue.upsertJobScheduler(
    BULLMQ.snapshots.schedulers.weeklySnapshot,
    repeat,
    {
      name: BULLMQ.snapshots.jobs.createWeeklySnapshot,
    },
  );
};

export const removeWeeklyCryptotokenSnapshotScheduler = async () => {
  return snapshotsQueue.removeJobScheduler(
    BULLMQ.snapshots.schedulers.weeklySnapshot,
  );
};

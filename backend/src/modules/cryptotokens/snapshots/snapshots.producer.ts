import type { RepeatOptions } from "bullmq";

import {
  CRYPTOTOKEN_SNAPSHOTS_JOB_NAMES,
  CRYPTOTOKEN_SNAPSHOTS_SCHEDULER_IDS,
} from "./snapshots.constants.js";
import { snapshotsQueue } from "./snapshots.queue.js";
import type { RefreshCryptotokenSnapshotsJobData } from "./snapshots.types.js";

const defaultRefreshJobData: RefreshCryptotokenSnapshotsJobData = {
  requestedBy: "scheduler",
};

export const enqueueRefreshCryptotokenSnapshotsJob = async (
  data: RefreshCryptotokenSnapshotsJobData = defaultRefreshJobData,
) => {
  return snapshotsQueue.add(
    CRYPTOTOKEN_SNAPSHOTS_JOB_NAMES.REFRESH_WEEKLY_SNAPSHOT,
    data,
    {
      jobId: `cryptotokens-snapshots-refresh:${data.requestedBy}`,
    },
  );
};

export const upsertRefreshCryptotokenSnapshotsScheduler = async (
  repeat: Omit<RepeatOptions, "key">,
  data: RefreshCryptotokenSnapshotsJobData = defaultRefreshJobData,
) => {
  return snapshotsQueue.upsertJobScheduler(
    CRYPTOTOKEN_SNAPSHOTS_SCHEDULER_IDS.weeklyRefresh,
    repeat,
    {
      name: CRYPTOTOKEN_SNAPSHOTS_JOB_NAMES.REFRESH_WEEKLY_SNAPSHOT,
      data,
    },
  );
};

export const removeRefreshCryptotokenSnapshotsScheduler = async () => {
  return snapshotsQueue.removeJobScheduler(
    CRYPTOTOKEN_SNAPSHOTS_SCHEDULER_IDS.weeklyRefresh,
  );
};

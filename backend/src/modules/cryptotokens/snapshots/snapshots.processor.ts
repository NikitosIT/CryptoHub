import type { Job } from "bullmq";

import { snapshotsService } from "./snapshots.service.js";
import type {
  RefreshCryptotokenSnapshotsJobData,
  RefreshCryptotokenSnapshotsResult,
} from "./snapshots.types.js";

export const processRefreshCryptotokenSnapshotsJob = async (
  _job: Job<RefreshCryptotokenSnapshotsJobData>,
): Promise<RefreshCryptotokenSnapshotsResult> => {
  return snapshotsService.refreshWeeklySnapshot();
};

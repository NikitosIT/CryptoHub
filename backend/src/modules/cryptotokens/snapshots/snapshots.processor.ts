import type { Job } from "bullmq";

import { snapshotsService } from "./snapshots.service.js";
import type { CreateWeeklyCryptotokenSnapshotResult } from "./snapshots.types.js";

export const processCreateWeeklyCryptotokenSnapshotJob = async (
  _job: Job<void>,
): Promise<CreateWeeklyCryptotokenSnapshotResult> => {
  return snapshotsService.createWeeklySnapshot();
};

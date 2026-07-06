import type { Job } from "bullmq";

import { snapshotsService } from "./cryptotokens.service.js";
import type { CreateWeeklyCryptotokenSnapshotResult } from "./cryptotokens.types.js";

export const processCreateWeeklyCryptotokenSnapshotJob = async (
  _job: Job<void>,
): Promise<CreateWeeklyCryptotokenSnapshotResult> => {
  return snapshotsService.createWeeklySnapshot();
};

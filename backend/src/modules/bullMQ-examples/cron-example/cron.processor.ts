import type { Job } from "bullmq";

import { cronExampleService } from "./cron.service.js";
import type { CronExampleMessageData } from "./cron.types.js";

export const processPeriodicMessageJob = async (
  job: Job<CronExampleMessageData>,
): Promise<void> => {
  await cronExampleService.sendPeriodicMessage(job.data);
};

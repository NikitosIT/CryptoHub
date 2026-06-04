import type { RepeatOptions } from "bullmq";

import { BULLMQ } from "@/constants/bullmq.js";

import { cronExampleQueue } from "./cron.queue.js";
import type { CronExampleMessageData } from "./cron.types.js";

export const enqueueCronExampleMessageJob = async (
  data: CronExampleMessageData,
) => {
  return cronExampleQueue.add(BULLMQ.cronExample.jobs.sendPeriodicMessage, data, {
    jobId: `cron-example-message:${data.recipientId}`,
  });
};

export const upsertCronExampleMessageScheduler = async (
  data: CronExampleMessageData,
  repeat: Omit<RepeatOptions, "key">,
) => {
  return cronExampleQueue.upsertJobScheduler(
    BULLMQ.cronExample.schedulers.periodicMessage,
    repeat,
    {
      name: BULLMQ.cronExample.jobs.sendPeriodicMessage,
      data,
    },
  );
};

export const removeCronExampleMessageScheduler = async () => {
  return cronExampleQueue.removeJobScheduler(BULLMQ.cronExample.schedulers.periodicMessage);
};

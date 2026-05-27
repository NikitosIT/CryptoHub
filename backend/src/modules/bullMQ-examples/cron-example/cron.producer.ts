import type { RepeatOptions } from "bullmq";

import { cronExampleQueue } from "./cron.queue.js";
import {
  CRON_EXAMPLE_JOB_NAMES,
  CRON_EXAMPLE_SCHEDULER_IDS,
  type CronExampleMessageData,
} from "./cron.types.js";

export const enqueuePeriodicMessageJob = async (
  data: CronExampleMessageData,
) => {
  return cronExampleQueue.add(
    CRON_EXAMPLE_JOB_NAMES.SEND_PERIODIC_MESSAGE,
    data,
    {
      jobId: `cron-example-message:${data.recipientId}`,
    },
  );
};

export const upsertPeriodicMessageScheduler = async (
  data: CronExampleMessageData,
  repeat: Omit<RepeatOptions, "key">,
) => {
  return cronExampleQueue.upsertJobScheduler(
    CRON_EXAMPLE_SCHEDULER_IDS.periodicMessage,
    repeat,
    {
      name: CRON_EXAMPLE_JOB_NAMES.SEND_PERIODIC_MESSAGE,
      data,
    },
  );
};

export const removePeriodicMessageScheduler = async () => {
  return cronExampleQueue.removeJobScheduler(
    CRON_EXAMPLE_SCHEDULER_IDS.periodicMessage,
  );
};

export const CRON_EXAMPLE_QUEUE_NAME = "cron-example-message";

export const CRON_EXAMPLE_JOB_NAMES = {
  SEND_PERIODIC_MESSAGE: "send-periodic-message",
} as const;

export const CRON_EXAMPLE_SCHEDULER_IDS = {
  periodicMessage: "cron-example-periodic-message",
} as const;

export type CronExampleMessageData = {
  recipientId: string;
  recipientName: string;
  message: string;
};

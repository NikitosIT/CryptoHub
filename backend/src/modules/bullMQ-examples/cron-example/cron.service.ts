import { logger } from "@/libs/logger.js";

import type { CronExampleMessageData } from "./cron.types.js";

const sendPeriodicMessage = async ({
  recipientId,
  recipientName,
  message,
}: CronExampleMessageData): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  logger.info(
    {
      recipientId,
      recipientName,
      message,
      provider: "fake-cron-message-provider",
    },
    "Cron example message sent",
  );
};

export const cronExampleService = {
  sendPeriodicMessage,
} as const;

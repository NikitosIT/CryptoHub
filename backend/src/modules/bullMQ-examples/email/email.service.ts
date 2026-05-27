import { logger } from "@/libs/logger.js";

import type { SendWelcomeEmailData } from "./email.types.js";

const fakeEmailProvider = async (
  email: string,
  subject: string,
  body: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 2_000));

  logger.info(
    {
      email,
      subject,
      preview: body,
      provider: "fake-email-provider",
    },
    "Fake email provider accepted message",
  );
};

const sendWelcomeEmail = async ({
  userId,
  email,
  name,
}: SendWelcomeEmailData): Promise<void> => {
  const subject = "Welcome to CryptoHub";
  const body = `Hello, ${name}! Your account ${userId} is ready.`;

  logger.info(
    {
      userId,
      email,
      template: "welcome-email",
    },
    "Sending welcome email",
  );

  await fakeEmailProvider(email, subject, body);

  logger.info(
    {
      userId,
      email,
      template: "welcome-email",
    },
    "Welcome email sent",
  );
};

export const emailService = {
  sendWelcomeEmail,
} as const;

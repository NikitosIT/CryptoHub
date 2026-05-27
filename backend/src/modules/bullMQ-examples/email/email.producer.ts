import { emailQueue } from "./email.queue.js";
import type { SendWelcomeEmailData } from "./email.types.js";

export const EMAIL_JOB_NAMES = {
  SEND_WELCOME_EMAIL: "send-welcome-email",
} as const;

export async function addWelcomeEmailJob(data: SendWelcomeEmailData) {
  return emailQueue.add(EMAIL_JOB_NAMES.SEND_WELCOME_EMAIL, data, {
    jobId: `welcome-email:${data.userId}`,
    delay: 5 * 60 * 1000,
  });
}

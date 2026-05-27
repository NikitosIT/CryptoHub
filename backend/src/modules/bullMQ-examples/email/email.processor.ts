import type { Job } from "bullmq";

import { emailService } from "./email.service.js";
import type { SendWelcomeEmailData } from "./email.types.js";

export async function processWelcomeEmailJob(
  job: Job<SendWelcomeEmailData>,
): Promise<void> {
  await emailService.sendWelcomeEmail(job.data);
}

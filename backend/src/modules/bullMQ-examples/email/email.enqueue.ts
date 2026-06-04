import { BULLMQ } from "@/constants/bullmq.js";

import { emailQueue } from "./email.queue.js";
import type { SendWelcomeEmailData } from "./email.types.js";

export async function enqueueWelcomeEmailJob(data: SendWelcomeEmailData) {
  return emailQueue.add(BULLMQ.email.jobs.sendWelcomeEmail, data, {
    jobId: `welcome-email:${data.userId}`,
    delay: 5 * 60 * 1000,
  });
}

import type { Worker } from "bullmq";

import { createCronExampleWorker } from "@/modules/bullMQ-examples/cron-example/cron.worker.js";
import { createEmailWorker } from "@/modules/bullMQ-examples/email/email.worker.js";
import { createCryptotokenSnapshotsWorker } from "@/modules/cryptotokens/snapshots/snapshots.worker.js";

export function startWorkers(): Worker[] {
  return [
    createCryptotokenSnapshotsWorker(),
    createEmailWorker(),
    createCronExampleWorker(),
  ];
}

export async function stopWorkers(workers: Worker[]) {
  await Promise.all(workers.map((worker) => worker.close()));
}

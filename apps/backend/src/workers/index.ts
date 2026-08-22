import type { Worker } from "bullmq";

import { registerCryptotokenSchedulers } from "@/modules/cryptotokens/cryptotokens.scheduler.js";
import { createCryptotokenSnapshotsWorker } from "@/modules/cryptotokens/cryptotokens.worker.js";

export async function registerSchedulers() {
  await registerCryptotokenSchedulers();
}
// раз в какое то время ложи на полку задачу.

export function startWorkers(): Worker[] {
  return [createCryptotokenSnapshotsWorker()];
}
// создает воркера - че это значит.

export async function stopWorkers(workers: Worker[]) {
  await Promise.all(workers.map((worker) => worker.close()));
}

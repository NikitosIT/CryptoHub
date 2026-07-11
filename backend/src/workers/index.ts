import type { Worker } from "bullmq";

import { createCryptotokenSnapshotsWorker } from "@/modules/cryptotokens/cryptotokens.worker.js";

export function startWorkers(): Worker[] {
  return [createCryptotokenSnapshotsWorker()];
}

export async function stopWorkers(workers: Worker[]) {
  await Promise.all(workers.map((worker) => worker.close()));
}

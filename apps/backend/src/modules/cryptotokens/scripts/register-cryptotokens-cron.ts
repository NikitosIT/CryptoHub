import "dotenv/config";

import { connectBullmq, disconnectBullmq } from "@/libs/bullmq.js";

import { registerCryptotokenSchedulers } from "../cryptotokens.scheduler.js";

try {
  await connectBullmq();
  await registerCryptotokenSchedulers();
} finally {
  await disconnectBullmq();
}

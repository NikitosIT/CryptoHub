import type { TransportTargetOptions } from "pino";
import pino from "pino";

import { env } from "@/config/env.js";

const level = env.LOG_LEVEL;
const lokiHost = env.LOKI_URL;

const targets: TransportTargetOptions[] = [
  {
    target: "pino-pretty",
    level,
    options: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  },
  {
    target: "pino-loki",
    level,
    options: {
      host: lokiHost,
      batching: {
        interval: 5,
        maxBufferSize: 10_000,
      },
      labels: {
        app: "cryptohub",
        env: env.NODE_ENV,
        service: "cryptohub-backend",
      },
    },
  },
];

const transport = pino.transport({ targets });

export const logger = pino(
  {
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.epochTime,
  },
  transport,
);

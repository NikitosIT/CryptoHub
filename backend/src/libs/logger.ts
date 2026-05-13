import type { TransportTargetOptions } from "pino";
import pino from "pino";

const level = process.env.LOG_LEVEL || "info";
const lokiHost = process.env.LOKI_URL || "http://localhost:3100";

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
        env: process.env.NODE_ENV || "local",
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

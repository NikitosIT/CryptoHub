import fs from "node:fs";
import path from "node:path";

import pino from "pino";

const level = process.env.LOG_LEVEL || "info";
const logDir = path.resolve(process.cwd(), process.env.LOG_DIR || "logs");
const logFilePath = path.join(logDir, process.env.LOG_FILE || "backend.ndjson");

fs.mkdirSync(logDir, { recursive: true });

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level,
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
    {
      target: "pino/file",
      level,
      options: {
        destination: logFilePath,
        mkdir: true,
      },
    },
  ],
});

export const logger = pino(
  {
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

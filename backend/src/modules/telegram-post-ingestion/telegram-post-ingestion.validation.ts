import type { NextFunction } from "express";

import { parseTelegramPostIngestion } from "./telegram-post-ingestion.mapper.js";
import type {
  TelegramPostIngestionRequest,
  TelegramPostIngestionResponse,
} from "./telegram-post-ingestion.types.js";

export const validateTelegramPostIngestion = (
  req: TelegramPostIngestionRequest,
  _res: TelegramPostIngestionResponse,
  next: NextFunction,
): void => {
  req.body = parseTelegramPostIngestion(req.body);

  next();
};

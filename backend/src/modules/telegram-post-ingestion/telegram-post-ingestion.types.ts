import type { Request, Response } from "express";

import type {
  TelegramPostIngestionInput,
  TelegramPostIngestionSuccessResponse,
} from "./telegram-post-ingestion.schema.js";

export type TelegramPostIngestionRequest = Request<
  Record<string, never>,
  TelegramPostIngestionSuccessResponse,
  TelegramPostIngestionInput
>;

export type TelegramPostIngestionResponse =
  Response<TelegramPostIngestionSuccessResponse>;

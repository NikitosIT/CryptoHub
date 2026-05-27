import type { Request, Response } from "express";
import type { Update } from "telegram-media";

export type TelegramPostIngestionSuccessResponse = {
  message: "Post ingestion processed";
};

export type TelegramPostIngestionRequest = Request<
  Record<string, never>,
  TelegramPostIngestionSuccessResponse,
  Update
>;

export type TelegramPostIngestionResponse =
  Response<TelegramPostIngestionSuccessResponse>;

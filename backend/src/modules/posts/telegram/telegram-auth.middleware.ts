import type { NextFunction, Request, Response } from "express";

import { env } from "@/config/env.js";
import { AppError } from "@/utils/AppError.js";

const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";

const webhookSecret = env.TELEGRAM_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET is required");
}

export const authenticateTelegramIngestion = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const requestSecret = req.header(TELEGRAM_SECRET_HEADER);

  if (!requestSecret) {
    return next(new AppError("Missing Telegram webhook secret", 401));
  }

  if (requestSecret !== webhookSecret) {
    return next(new AppError("Invalid Telegram webhook secret", 403));
  }

  return next();
};

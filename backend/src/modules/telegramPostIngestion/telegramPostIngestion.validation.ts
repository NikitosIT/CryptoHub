import type { NextFunction, Request, Response } from "express";

import { parseTelegramPostIngestion } from "./telegramPostIngestion.mapper.js";

export const validateTelegramPostIngestion = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  req.body = parseTelegramPostIngestion(req.body);

  next();
};

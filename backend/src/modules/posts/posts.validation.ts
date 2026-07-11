import type { NextFunction } from "express";

import { telegramPostsQuerySchema } from "./posts.schema.js";
import type {
  TelegramPostsRequest,
  TelegramPostsResponse,
} from "./posts.types.js";

export const validateTelegramPosts = (
  req: TelegramPostsRequest,
  res: TelegramPostsResponse,
  next: NextFunction,
): void => {
  const query = telegramPostsQuerySchema.parse(req.query);
  res.locals.query = query;

  next();
};

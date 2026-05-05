import type { NextFunction } from "express";

import { telegramPostsQuerySchema } from "./telegram-posts.schema.js";
import type {
  TelegramPostsRequest,
  TelegramPostsResponse,
} from "./telegram-posts.types.js";

export const validateTelegramPosts = (
  req: TelegramPostsRequest,
  _res: TelegramPostsResponse,
  next: NextFunction,
): void => {
  telegramPostsQuerySchema.parse(req.query);

  next();
};

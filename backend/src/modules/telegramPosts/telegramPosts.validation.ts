import type { NextFunction, Request, Response } from "express";

import {
  type TelegramPostsQuery,
  telegramPostsQuerySchema,
} from "./telegramPosts.schema.js";

export type TelegramPostsResponseLocals = {
  telegramPostsQuery: TelegramPostsQuery;
};

export type TelegramPostsRequest = Request<
  Record<string, never>,
  unknown,
  unknown,
  TelegramPostsQuery
>;

export type TelegramPostsResponse = Response<
  unknown,
  TelegramPostsResponseLocals
>;

export const validateTelegramPosts = (
  req: TelegramPostsRequest,
  res: TelegramPostsResponse,
  next: NextFunction,
): void => {
  res.locals.telegramPostsQuery = telegramPostsQuerySchema.parse(req.query);

  next();
};

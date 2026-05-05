import type { Request, Response } from "express";

import type { TelegramPost } from "../../../prisma/generated/prisma/client.js";
import type { PaginatedResult } from "../paginate/paginate.service.js";
import { type TelegramPostsQuery } from "./telegram-posts.schema.js";

export type TelegramPostsRequest = Request<
  Record<string, never>,
  unknown,
  unknown,
  TelegramPostsQuery
>;

export type TelegramPostsResponse = Response<PaginatedResult<TelegramPost>>;

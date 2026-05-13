import { z } from "zod";

import {
  createPaginatedResponseSchema,
  cursorPaginationQuerySchema,
} from "../paginate/paginate.schema.js";

export const telegramPostsQuerySchema = cursorPaginationQuerySchema;

export const telegramPostTextEntitySchema = z
  .object({
    offset: z.number().int().nonnegative(),
    length: z.number().int().positive(),
    type: z.string(),
  })
  .strict();

export const telegramPostMediaItemSchema = z
  .object({
    fileId: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .strict();

export const telegramPostSchema = z
  .object({
    id: z.number().int().positive(),
    textCaption: z.string().nullable(),
    textEntities: z.array(telegramPostTextEntitySchema).nullable(),
    cryptoTokens: z.array(z.string()),
    tgAuthorId: z.string(),
    mediaGroupId: z.string().nullable(),
    media: z.array(telegramPostMediaItemSchema).nullable(),
    likeCount: z.number().int().nonnegative(),
    dislikeCount: z.number().int().nonnegative(),
    favoritesCount: z.number().int().nonnegative(),
    commentsCount: z.number().int().nonnegative(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const telegramPostsListResponseSchema =
  createPaginatedResponseSchema(telegramPostSchema);

export type TelegramPostsQuery = z.infer<typeof telegramPostsQuerySchema>;
export type TelegramPostsListResponse = z.infer<
  typeof telegramPostsListResponseSchema
>;

import z from "zod";

import { cursorPaginationQuerySchema } from "@/modules/paginate/paginate.schema.js";

const positiveIntParamSchema = z.coerce.number().int().positive();

const commentIdParamsSchema = z
  .object({
    postId: positiveIntParamSchema,
    commentId: positiveIntParamSchema,
  })
  .strict();

const commentTextSchema = z
  .string()
  .trim()
  .min(1, "Comment text cannot be empty")
  .max(1000);

const commentMediaInputSchema = z
  .object({
    type: z.enum(["photo", "video"]),
    key: z.string().trim().min(1),
    storage: z.string().trim().min(1).optional(),
    bucket: z.string().trim().min(1).optional(),
    url: z.url().optional(),
    mimeType: z.string().trim().min(1).optional(),
    size: z.int().positive().optional(),
    width: z.int().positive().optional(),
    height: z.int().positive().optional(),
  })
  .strict();

const commentBodyBaseSchema = z
  .object({
    text: commentTextSchema.optional(),
    media: z.array(commentMediaInputSchema).optional(),
  })
  .strict();

export const listCommentsParamsSchema = z
  .object({
    postId: positiveIntParamSchema,
  })
  .strict();

export const listCommentsQuerySchema = cursorPaginationQuerySchema;

export const createCommentBodySchema = commentBodyBaseSchema
  .extend({
    parentCommentId: z.coerce.number().int().positive().nullable().optional(),
  })
  .strict()
  .refine(
    ({ text, media }) => text !== undefined || Boolean(media?.length),
    "Comment must have text or media",
  );

export const updateCommentBodySchema = commentBodyBaseSchema;

export const createCommentParamsSchema = listCommentsParamsSchema;
export const updateCommentParamsSchema = commentIdParamsSchema;
export const deleteCommentParamsSchema = commentIdParamsSchema;

export type ListCommentsParams = z.infer<typeof listCommentsParamsSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
export type CommentMediaInput = z.infer<typeof commentMediaInputSchema>;
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
export type UpdateCommentBody = z.infer<typeof updateCommentBodySchema>;

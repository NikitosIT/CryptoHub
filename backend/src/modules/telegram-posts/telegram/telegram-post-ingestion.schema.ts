import { z } from "zod";

const telegramEntityBaseShape = {
  offset: z.number().int().nonnegative(),
  length: z.number().int().positive(),
  type: z.string(),
  url: z.url().optional(),
} as const;

const telegramMediaDimensionsShape = {
  width: z.number().int().positive(),
  height: z.number().int().positive(),
} as const;

const telegramReplyChatSchema = z.looseObject({
  id: z.number().int(),
});

const telegramForwardOriginChatSchema = z.looseObject({
  id: z.number().int(),
  title: z.string().optional(),
  username: z.string().optional(),
  type: z.literal("channel").optional(),
});

const telegramForwardOriginSchema = z.looseObject({
  type: z.literal("channel").optional(),
  chat: telegramForwardOriginChatSchema,
});

const telegramCaptionEntitySchema = z.looseObject({
  ...telegramEntityBaseShape,
  custom_emoji_id: z.string().optional(),
});

const telegramPhotoSizeSchema = z.looseObject({
  file_id: z.string(),
  ...telegramMediaDimensionsShape,
});

const telegramVideoSchema = z.looseObject({
  file_id: z.string(),
  ...telegramMediaDimensionsShape,
  duration: z.number().int().nonnegative(),
});

const telegramPostIngestionMessageSchema = z.looseObject({
  chat: telegramReplyChatSchema,
  caption: z.string().optional(),
  caption_entities: z.array(telegramCaptionEntitySchema).optional(),
  forward_origin: telegramForwardOriginSchema,
  media_group_id: z.string().optional(),
  photo: z.array(telegramPhotoSizeSchema).min(1).optional(),
  video: telegramVideoSchema.optional(),
});

export const telegramPostIngestionUpdateSchema = z.looseObject({
  update_id: z.number().int().nonnegative(),
  message: telegramPostIngestionMessageSchema,
});

export const telegramPostIngestionCaptionEntitySchema = z
  .object({
    ...telegramEntityBaseShape,
    customEmojiId: z.string().optional(),
  })
  .strict();

export const telegramPostIngestionMediaItemSchema = z.discriminatedUnion(
  "type",
  [
    z
      .object({
        type: z.literal("photo"),
        fileId: z.string(),
        ...telegramMediaDimensionsShape,
      })
      .strict(),
    z
      .object({
        type: z.literal("video"),
        fileId: z.string(),
        ...telegramMediaDimensionsShape,
        duration: z.number().int().nonnegative(),
      })
      .strict(),
  ],
);

export const telegramPostIngestionInputSchema = z
  .object({
    caption: z.string().nullable(),
    captionEntities: z
      .array(telegramPostIngestionCaptionEntitySchema)
      .nullable(),
    forwardOriginChatId: z.number().int(),
    forwardOriginChatTitle: z.string(),
    forwardOriginChatUsername: z.string(),
    media: z.array(telegramPostIngestionMediaItemSchema).nullable(),
    mediaGroupId: z.string().nullable(),
    replyChatId: z.number().int(),
  })
  .strict();

export const telegramPostIngestionSuccessResponseSchema = z
  .object({
    message: z.literal("Post ingestion processed"),
  })
  .strict();

export type TelegramPostIngestionUpdate = z.infer<
  typeof telegramPostIngestionUpdateSchema
>;
export type TelegramPostIngestionCaptionEntity = z.infer<
  typeof telegramPostIngestionCaptionEntitySchema
>;
export type TelegramPostIngestionMediaItem = z.infer<
  typeof telegramPostIngestionMediaItemSchema
>;
export type TelegramPostIngestionInput = z.infer<
  typeof telegramPostIngestionInputSchema
>;
export type TelegramPostIngestionSuccessResponse = z.infer<
  typeof telegramPostIngestionSuccessResponseSchema
>;

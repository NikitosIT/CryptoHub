import { z } from "zod";

export const TelegramPhotoSchema = z.object({
  file_id: z.string(),
  file_unique_id: z.string(),
  file_size: z.number().optional(),
  width: z.number(),
  height: z.number(),
});

export const TelegramChatSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  type: z.string(),
  username: z.string().optional(),
});

export const TelegramForwardOriginSchema = z
  .object({
    type: z.string(),
    chat: TelegramChatSchema,
    message_id: z.number(),
    date: z.number(),
  })
  .optional();

export const TelegramCaptionEntitySchema = z.object({
  offset: z.number(),
  length: z.number(),
  type: z.string(),
  url: z.string().optional(),
  custom_emoji_id: z.string().optional(),
});

export const TelegramMessageSchema = z.object({
  message_id: z.number(),

  chat: TelegramChatSchema,

  date: z.number(),

  forward_origin: TelegramForwardOriginSchema,

  media_group_id: z.string().optional(),

  photo: z.array(TelegramPhotoSchema).optional(),

  caption: z.string().optional(),
  text: z.string().optional(),

  caption_entities: z.array(TelegramCaptionEntitySchema).optional(),
  entities: z.array(TelegramCaptionEntitySchema).optional(),
});

export const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: TelegramMessageSchema.optional(),
  edited_message: TelegramMessageSchema.optional(),
  channel_post: TelegramMessageSchema.optional(),
  edited_channel_post: TelegramMessageSchema.optional(),
});

export const TelegramPostSchema = z.object({
  sourceChatId: z.string().nullable(),
  sourceChatTitle: z.string().nullable(),
  mediaGroupId: z.string().nullable(),
  media: z.array(z.string()).nullable(),
  text: z.string().nullable(),
  textEntities: z.array(TelegramCaptionEntitySchema).nullable(),
  chatId: z.number(),
});

export type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;
export type TelegramMessage = z.infer<typeof TelegramMessageSchema>;
export type TelegramPostDTO = z.infer<typeof TelegramPostSchema>;

import {
  type TelegramPostIngestionInput,
  telegramPostIngestionInputSchema,
  telegramPostIngestionUpdateSchema,
} from "./telegramPostIngestion.schema.js";

export const parseTelegramPostIngestion = (
  input: unknown,
): TelegramPostIngestionInput => {
  const { message } = telegramPostIngestionUpdateSchema.parse(input);

  const media = message.photo
    ? message.photo.map((photo) => ({
        type: "photo" as const,
        fileId: photo.file_id,
        width: photo.width,
        height: photo.height,
      }))
    : message.video
      ? [
          {
            type: "video" as const,
            fileId: message.video.file_id,
            width: message.video.width,
            height: message.video.height,
            duration: message.video.duration,
          },
        ]
      : null;

  return telegramPostIngestionInputSchema.parse({
    caption: message.caption ?? null,
    captionEntities:
      message.caption_entities?.map((entity) => ({
        offset: entity.offset,
        length: entity.length,
        type: entity.type,
        url: entity.url,
        customEmojiId: entity.custom_emoji_id,
      })) ?? null,
    forwardOriginChatId: message.forward_origin.chat.id,
    forwardOriginChatTitle: message.forward_origin.chat.title,
    forwardOriginChatUsername: message.forward_origin.chat.username,
    media,
    mediaGroupId: message.media_group_id ?? null,
    replyChatId: message.chat.id,
  });
};

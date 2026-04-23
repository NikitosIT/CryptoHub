import { TelegramPostSchema, TelegramUpdateSchema } from "./telegramSchema.js";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export const tgBotSend = async (chatId: number, text: string) => {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
};

export const parseTelegramPost = (update: unknown) => {
  const parsedUpdate = TelegramUpdateSchema.safeParse(update);

  if (!parsedUpdate.success) {
    return null;
  }

  const message = parsedUpdate.data.message ?? parsedUpdate.data.channel_post;

  if (!message) return null;

  const photos = message.photo;

  const text = message.caption ?? message.text ?? null;
  const textEntities = message.caption_entities ?? message.entities ?? null;

  const raw = {
    sourceChatId: message.forward_origin?.chat?.id?.toString() ?? null,
    sourceChatTitle: message.forward_origin?.chat?.title ?? null,
    mediaGroupId: message.media_group_id ?? null,
    media: photos?.length ? photos.map((photo) => photo.file_id) : null,
    text,
    textEntities,
    chatId: message.chat.id,
  };

  const validated = TelegramPostSchema.safeParse(raw);

  if (!validated.success) return null;

  return validated;
};

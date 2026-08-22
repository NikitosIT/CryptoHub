import type { InferTelegramCollectorPost, Update } from "telegram-media";
import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
  defineTelegramMediaFields,
} from "telegram-media";

import { externalApi } from "@/config/external-api.js";
import { prisma } from "@/libs/db.js";
import { logger } from "@/libs/logger.js";
import { appRedis } from "@/libs/redis.js";

import { mapTelegramPostToCreateInput } from "../telegram.mapper.js";

const TELEGRAM_POST_INGESTION_SUCCESS_MESSAGE = "Post Saved✅";

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "height"],
  video: ["duration", "fileId"],
  audio: ["performer", "mimeType", "duration"],
});

const collector = createTelegramMediaGroup({
  onCollected: async (post) => {
    const data = await mapTelegramPostToCreateInput(post);

    await prisma.telegramPost.create({
      data,
    });
    await sendTelegramConfirmation(post.message.chat.id);
  },
  mediaFields,
  timeoutMs: 2000,
  storage: createRedisMediaGroupStorage(appRedis),
  onError: (error, context) => {
    logger.error(
      { err: error, context },
      "Telegram media group collector error",
    );
  },
});

export type TelegramIngestionPost = InferTelegramCollectorPost<
  typeof collector
>;

const createTelegramPost = async (update: Update) => {
  await collector.collect(update);
};

const sendTelegramConfirmation = async (
  chatId: number | string,
): Promise<void> => {
  const response = await fetch(`${externalApi.telegram.botUrl}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: TELEGRAM_POST_INGESTION_SUCCESS_MESSAGE,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Failed to send Telegram message: ${errorText}`);
  }
};

export const telegramPostIngestionService = {
  createTelegramPost,
} as const;

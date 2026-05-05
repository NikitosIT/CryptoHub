import { Prisma } from "prisma/generated/prisma/client.js";

import { prisma } from "@/libs/db.js";

import type { TelegramPostIngestionInput } from "../telegramPostIngestion.schema.js";
import { telegramBotService } from "./telegramBot.service.js";

const TELEGRAM_POST_INGESTION_SUCCESS_MESSAGE = "Post Saved✅";

const telegramPostCreateData = (
  input: TelegramPostIngestionInput,
): Prisma.TelegramPostCreateInput => ({
  textCaption: input.caption,
  textEntities:
    input.captionEntities === null ? Prisma.JsonNull : input.captionEntities,
  cryptoTokens: [],
  tgAuthorId: String(input.forwardOriginChatId),
  tgAuthorTitle: input.forwardOriginChatTitle,
  tgAuthorUsername: input.forwardOriginChatUsername,
  mediaGroupId: input.mediaGroupId,
  media: input.media === null ? Prisma.JsonNull : input.media,
});

const processUpdate = async (
  input: TelegramPostIngestionInput,
): Promise<void> => {
  await prisma.telegramPost.create({
    data: telegramPostCreateData(input),
  });
  await telegramBotService.sendMessage(
    input.replyChatId,
    TELEGRAM_POST_INGESTION_SUCCESS_MESSAGE,
  );
};

export const telegramPostIngestionService = {
  processUpdate,
} as const;

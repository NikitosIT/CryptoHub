import { Prisma } from "prisma/generated/prisma/client.js";

import { cryptoTokenExtractionService } from "./services/crypto-token-extraction.service.js";
import type { TelegramIngestionPost } from "./services/ingestion.service.js";

export const mapTelegramPostToCreateInput = async (
  post: TelegramIngestionPost,
) => {
  const sourceMessage = post.message;
  const sourceText = sourceMessage.caption ?? sourceMessage.text ?? "";

  const sourceChat =
    sourceMessage.forward_origin?.type === "channel"
      ? sourceMessage.forward_origin.chat
      : null;
  const cryptoTokens =
    await cryptoTokenExtractionService.extractCryptoTokensFromText(sourceText);

  return {
    textCaption: sourceMessage.caption ?? null,
    textEntities: sourceMessage.caption_entities ?? Prisma.JsonNull,
    cryptoTokens,
    tgAuthorId: String(sourceChat?.id ?? ""),
    tgAuthorTitle: sourceChat?.title ?? "",
    tgAuthorUsername: sourceChat?.username ?? "",
    mediaGroupId: sourceMessage.media_group_id ?? null,
    media: post.media ?? Prisma.JsonNull,
  };
};

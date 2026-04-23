import { Request, Response } from "express";

import { prisma } from "@/shared/libs/db.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";

import { parseTelegramPost, tgBotSend } from "./telegram.service.js";

export const telegramWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const result = parseTelegramPost(req.body);

    if (!result?.success) {
      console.log("Invalid Telegram payload");
      return res.sendStatus(200);
    }

    const dto = result.data;

    await prisma.telegramPost.create({
      data: {
        textCaption: dto.text,
        textEntities: dto.textEntities ?? undefined,
        cryptoTokens: [],
        tgAuthorId: dto.sourceChatId ? BigInt(dto.sourceChatId) : null,
        mediaGroupId: dto.mediaGroupId,
        media: dto.media ?? undefined,
      },
    });

    await tgBotSend(dto.chatId, "Ouesss🐷");

    return res.sendStatus(200);
  },
);

// Todo complete media and create storage

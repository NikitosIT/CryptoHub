import type { Response } from "express";

import { AppError } from "@/utils/AppError.js";

import { cryptoAiService } from "./crypto-ai.service.js";
import type {
  ChatByIdRequest,
  ChatByIdResponse_,
  ChatStreamRequest,
  UsageTodayRequest,
  UsageTodayResponse_,
} from "./crypto-ai.types.js";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export const cryptoAiController = {
  stream: async (req: ChatStreamRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { action, tokenSymbol } = req.body;

    const chat = await cryptoAiService.initChat({
      userId,
      action,
      tokenSymbol,
    });

    res.writeHead(200, SSE_HEADERS);

    await cryptoAiService.runStream({
      chatId: chat.id,
      action,
      tokenSymbol,
      transport: {
        writeEvent: (data) => {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        },
        onClose: (handler) => {
          req.on("close", handler);
        },
        offClose: (handler) => {
          req.off("close", handler);
        },
        end: () => {
          res.end();
        },
      },
    });
  },

  getChat: async (
    req: ChatByIdRequest,
    res: ChatByIdResponse_,
  ): Promise<void> => {
    const chat = await cryptoAiService.getChatById(req.params.id);

    if (!chat) {
      throw new AppError("Chat not found", 404);
    }

    res.json(chat);
  },

  getUsage: async (
    req: UsageTodayRequest,
    res: UsageTodayResponse_,
  ): Promise<void> => {
    const usage = await cryptoAiService.getTodayUsage(req.user!.id);

    res.json(usage);
  },
};

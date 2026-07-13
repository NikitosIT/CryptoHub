import { prisma } from "@/libs/db.js";
import { openai } from "@/libs/openai.client.js";
import { AppError } from "@/utils/AppError.js";

import {
  type CryptoAiAction,
  DAILY_REQUEST_LIMIT,
  PROMPT_TEMPLATES,
} from "./crypto-ai.constants.js";
import type {
  ChatByIdResponse,
  UsageTodayResponse,
} from "./crypto-ai.schema.js";
import type {
  ChatResult,
  InitChatParams,
  RunStreamParams,
} from "./crypto-ai.types.js";

export const cryptoAiService = {
  // ── public read ──

  getTodayUsage: async (userId: string): Promise<UsageTodayResponse> => {
    const todayStart = new Date();

    todayStart.setHours(0, 0, 0, 0);

    const used = await prisma.cryptoAiChat.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    });

    return {
      used,
      limit: DAILY_REQUEST_LIMIT,
      remaining: Math.max(0, DAILY_REQUEST_LIMIT - used),
    };
  },

  getChatById: async (id: string): Promise<ChatByIdResponse | null> => {
    const chat = await prisma.cryptoAiChat.findFirst({
      where: { id, status: "COMPLETED" },
      select: {
        id: true,
        action: true,
        tokenSymbol: true,
        status: true,
        responseText: true,
        createdAt: true,
      },
    });

    if (!chat) return null;

    return {
      ...chat,
      createdAt: chat.createdAt.toISOString(),
    };
  },

  // ── streaming flow ──

  /** Check daily limit + create a STREAMING chat record. Throws AppError on limit hit or DB failure — let Express error handler catch it. */
  initChat: async (params: InitChatParams): Promise<ChatResult> => {
    const { userId, action, tokenSymbol } = params;

    const todayStart = new Date();

    todayStart.setHours(0, 0, 0, 0);

    const used = await prisma.cryptoAiChat.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    });

    if (used >= DAILY_REQUEST_LIMIT) {
      throw new AppError("Daily request limit reached", 429);
    }

    return prisma.cryptoAiChat.create({
      data: {
        userId,
        action,
        tokenSymbol,
        status: "STREAMING",
        request: { action, tokenSymbol },
      },
      select: {
        id: true,
        action: true,
        tokenSymbol: true,
        status: true,
        responseText: true,
        createdAt: true,
      },
    });
  },

  /** Full SSE streaming flow. Handles all in-stream errors internally via SSE error events — never throws. */
  runStream: async (params: RunStreamParams): Promise<void> => {
    const { chatId, action, tokenSymbol, transport } = params;

    transport.writeEvent({ type: "init", chatId });

    const abortController = new AbortController();
    let accumulated = "";

    const closeHandler = () => {
      abortController.abort();
      cryptoAiService
        .finalizeChat(chatId, accumulated || "", "ABORTED")
        .catch(() => {});
    };

    transport.onClose(closeHandler);

    try {
      const systemPrompt = PROMPT_TEMPLATES[action as CryptoAiAction].replace(
        "{tokenSymbol}",
        tokenSymbol,
      );

      const stream = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the forecast now." },
          ],
          stream: true,
          max_tokens: 600,
          temperature: 0.7,
        },
        { signal: abortController.signal },
      );

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;

        if (content) {
          accumulated += content;
          transport.writeEvent({ type: "chunk", content });
        }
      }

      transport.offClose(closeHandler);

      await cryptoAiService.finalizeChat(chatId, accumulated, "COMPLETED");

      transport.writeEvent({ type: "done" });
    } catch (err: unknown) {
      transport.offClose(closeHandler);

      if (err instanceof Error && err.name === "AbortError") {
        // Client disconnected — already handled in closeHandler
        return;
      }

      transport.writeEvent({
        type: "error",
        message: err instanceof Error ? err.message : "Stream failed",
      });
    } finally {
      transport.end();
    }
  },

  // ── helpers ──

  finalizeChat: async (
    chatId: string,
    responseText: string,
    status: "COMPLETED" | "ABORTED",
  ): Promise<void> => {
    await prisma.cryptoAiChat.update({
      where: { id: chatId },
      data: { responseText, status },
    });
  },
};

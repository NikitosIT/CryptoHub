import type { Request, Response } from "express";

import type { CryptoAiChat } from "../../../prisma/generated/prisma/client.js";
import type {
  ChatByIdParams,
  ChatByIdResponse,
  ChatStreamBody,
  UsageTodayResponse,
} from "./crypto-ai.schema.js";

export type SseTransport = {
  writeEvent: (data: Record<string, unknown>) => void;
  onClose: (handler: () => void) => void;
  offClose: (handler: () => void) => void;
  end: () => void;
};

export type InitChatParams = {
  userId: string;
  action: string;
  tokenSymbol: string;
};

export type RunStreamParams = {
  chatId: string;
  action: string;
  tokenSymbol: string;
  transport: SseTransport;
};

export type ChatStreamRequest = Request<
  Record<string, never>,
  never,
  ChatStreamBody
>;

export type ChatByIdRequest = Request<ChatByIdParams, ChatByIdResponse>;

export type ChatByIdResponse_ = Response<ChatByIdResponse>;

export type UsageTodayRequest = Request;

export type UsageTodayResponse_ = Response<UsageTodayResponse>;

export type CreateChatParams = {
  userId: string;
  action: string;
  tokenSymbol: string;
};

export type ChatResult = Pick<
  CryptoAiChat,
  "id" | "action" | "tokenSymbol" | "status" | "responseText" | "createdAt"
>;

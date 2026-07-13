import { z } from "zod";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";

import { openApiRegistry } from "../../openapi/registry.js";
import {
  chatByIdResponseSchema,
  chatStreamBodySchema,
  usageTodayResponseSchema,
} from "./crypto-ai.schema.js";

const authHeaderSchema = z.object({
  authorization: z.string().min(1).openapi({
    description: "Bearer token returned by the sign-in endpoint.",
    example: "Bearer your-auth-token",
  }),
});

const chatStreamRequestSchema = openApiRegistry.register(
  "CryptoAiChatStreamRequest",
  chatStreamBodySchema,
);

const chatByIdResultSchema = openApiRegistry.register(
  "CryptoAiChatByIdResponse",
  chatByIdResponseSchema,
);

const usageTodayResultSchema = openApiRegistry.register(
  "CryptoAiUsageTodayResponse",
  usageTodayResponseSchema,
);

// POST /api/crypto-ai/chat/stream
openApiRegistry.registerPath({
  method: "post",
  path: `${API_ROUTE_SEGMENTS.cryptoAi}/chat/stream`,
  tags: ["Crypto AI"],
  summary: "Start AI crypto chat stream",
  description: `Creates a new AI-powered crypto chat and streams the response via SSE (Server-Sent Events).

The response is a stream of JSON events:
- \`{"type":"init","chatId":"..."}\` — emitted first with the chat record ID
- \`{"type":"chunk","content":"..."}\` — partial text chunks from the AI
- \`{"type":"done"}\` — generation completed successfully
- \`{"type":"error","message":"..."}\` — an error occurred

Users are limited to ${3} requests per day. If the client disconnects mid-stream, the partial response is saved with status ABORTED and still counts toward the limit.`,
  request: {
    headers: authHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: chatStreamRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "SSE stream of AI-generated content.",
      content: {
        "text/event-stream": {
          schema: z.object({}),
        },
      },
    },
    400: {
      description: "Request body validation failed.",
    },
    401: {
      description: "Authentication is required.",
    },
    429: {
      description: "Daily request limit reached.",
    },
  },
});

// GET /api/crypto-ai/chat/:id
openApiRegistry.registerPath({
  method: "get",
  path: `${API_ROUTE_SEGMENTS.cryptoAi}/chat/{id}`,
  tags: ["Crypto AI"],
  summary: "Get completed chat by ID",
  description:
    "Returns a single chat record by its ID. Only chats with status COMPLETED are returned.",
  request: {
    headers: authHeaderSchema,
    params: z.object({
      id: z.string().min(1).describe("Chat record ID"),
    }),
  },
  responses: {
    200: {
      description: "Chat record found.",
      content: {
        "application/json": {
          schema: chatByIdResultSchema,
        },
      },
    },
    401: {
      description: "Authentication is required.",
    },
    404: {
      description: "Chat not found.",
    },
  },
});

// GET /api/crypto-ai/usage/today
openApiRegistry.registerPath({
  method: "get",
  path: `${API_ROUTE_SEGMENTS.cryptoAi}/usage/today`,
  tags: ["Crypto AI"],
  summary: "Get today's AI chat usage",
  description:
    "Returns the current user's daily usage count, limit, and remaining requests.",
  request: {
    headers: authHeaderSchema,
  },
  responses: {
    200: {
      description: "Current usage information.",
      content: {
        "application/json": {
          schema: usageTodayResultSchema,
        },
      },
    },
    401: {
      description: "Authentication is required.",
    },
  },
});

import { z } from "zod";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";

import { openApiRegistry } from "../../../openapi/registry.js";

const telegramWebhookSecretHeaderSchema = z.object({
  "x-telegram-bot-api-secret-token": z.string().min(1).openapi({
    description: "Secret token that Telegram sends with the webhook request.",
    example: "telegram-webhook-secret",
  }),
});

const telegramChatSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
});

const telegramMessageEntitySchema = z.object({
  offset: z.number(),
  length: z.number(),
  type: z.string(),
  url: z.string().optional(),
  custom_emoji_id: z.string().optional(),
});

const telegramPhotoSizeSchema = z.object({
  file_id: z.string(),
  width: z.number(),
  height: z.number(),
});

const telegramVideoSchema = z.object({
  file_id: z.string(),
  file_unique_id: z.string(),
  width: z.number(),
  height: z.number(),
  duration: z.number(),
});

const telegramForwardOriginChatSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string(),
  username: z.string().optional(),
});

const telegramForwardOriginSchema = z.object({
  type: z.literal("channel"),
  date: z.number(),
  message_id: z.number(),
  chat: telegramForwardOriginChatSchema,
});

const telegramMessageSchema = z.object({
  chat: telegramChatSchema,
  caption: z.string().optional(),
  caption_entities: z.array(telegramMessageEntitySchema).optional(),
  forward_origin: telegramForwardOriginSchema,
  media_group_id: z.string().optional(),
  photo: z.array(telegramPhotoSizeSchema).optional(),
  video: telegramVideoSchema.optional(),
});

const telegramPostIngestionBodySchema = z.object({
  update_id: z.number(),
  message: telegramMessageSchema,
});

const telegramPostIngestionResponseSchema = z.object({
  message: z.literal("Post ingestion processed"),
});

const telegramPostIngestionRequestSchema = openApiRegistry.register(
  "TelegramPostIngestionRequest",
  telegramPostIngestionBodySchema,
);

const telegramPostIngestionResultSchema = openApiRegistry.register(
  "TelegramPostIngestionResponse",
  telegramPostIngestionResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: API_ROUTE_SEGMENTS.telegram,
  tags: ["Telegram Posts"],
  summary: "Ingest forwarded Telegram post",
  description:
    "Webhook endpoint that receives a Telegram update, persists the forwarded post, and sends a confirmation message back to the chat.",
  request: {
    headers: telegramWebhookSecretHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: telegramPostIngestionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "The Telegram post was persisted successfully.",
      content: {
        "application/json": {
          schema: telegramPostIngestionResultSchema,
        },
      },
    },
    401: {
      description: "Telegram secret header is missing.",
    },
    403: {
      description: "Telegram secret header is invalid.",
    },
  },
});

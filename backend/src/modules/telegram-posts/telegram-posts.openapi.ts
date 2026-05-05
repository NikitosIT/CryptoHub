import { openApiRegistry } from "@/openapi/registry.js";

import {
  telegramPostSchema,
  telegramPostsListResponseSchema,
  telegramPostsQuerySchema,
} from "./telegram-posts.schema.js";

const telegramPostBasicSchema = openApiRegistry.register(
  "TelegramPost",
  telegramPostSchema,
);

const telegramPostsListSchema = openApiRegistry.register(
  "TelegramPostsListResponse",
  telegramPostsListResponseSchema,
);

openApiRegistry.register("TelegramPostsQuery", telegramPostsQuerySchema);

openApiRegistry.registerPath({
  method: "get",
  path: "/telegram-posts",
  tags: ["Telegram Posts"],
  summary: "List telegram posts",
  description: "Returns telegram posts ordered by newest first.",
  request: {
    query: telegramPostsQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated list of telegram posts.",
      content: {
        "application/json": {
          schema: telegramPostsListSchema,
        },
      },
    },
  },
});

void telegramPostBasicSchema;

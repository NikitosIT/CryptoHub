import { z } from "zod";

import { openApiRegistry } from "../../../openapi/registry.js";
import { toggleReactionBodySchema } from "./reactions.schema.js";

const authHeaderSchema = z.object({
  authorization: z.string().min(1).openapi({
    description: "Bearer token returned by the sign-in endpoint.",
    example: "Bearer your-auth-token",
  }),
});

const toggleReactionParamsOpenApiSchema = z
  .object({
    postId: z.number().int().positive().openapi({
      description: "Telegram post identifier.",
      example: 42,
    }),
  })
  .strict();

const toggleReactionResponseSchema = z
  .object({
    postId: z.number().int().positive(),
    status: z.enum(["liked", "disliked"]).nullable(),
    likeCount: z.number().int().nonnegative(),
    dislikeCount: z.number().int().nonnegative(),
  })
  .strict();

const toggleReactionRequestSchema = openApiRegistry.register(
  "ToggleReactionBody",
  toggleReactionBodySchema,
);

const toggleReactionResultSchema = openApiRegistry.register(
  "ToggleReactionResponse",
  toggleReactionResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: "/posts/{postId}/reactions",
  tags: ["Telegram Posts"],
  summary: "Toggle post reaction",
  description:
    "Adds, removes, or switches the authenticated user's reaction for the selected post and returns updated reaction counters.",
  request: {
    headers: authHeaderSchema,
    params: toggleReactionParamsOpenApiSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: toggleReactionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reaction state was updated successfully.",
      content: {
        "application/json": {
          schema: toggleReactionResultSchema,
        },
      },
    },
    400: {
      description: "Route params or request body validation failed.",
    },
    401: {
      description: "Authentication is required.",
    },
    404: {
      description: "Post was not found.",
    },
  },
});

import { z } from "zod";

import { openApiRegistry } from "../../../openapi/registry.js";

const authHeaderSchema = z.object({
  authorization: z.string().min(1).openapi({
    description: "Bearer token returned by the sign-in endpoint.",
    example: "Bearer your-auth-token",
  }),
});

const toggleFavoriteParamsOpenApiSchema = z
  .object({
    postId: z.number().int().positive().openapi({
      description: "Telegram post identifier.",
      example: 42,
    }),
  })
  .strict();

const toggleFavoriteResponseSchema = z
  .object({
    isFavorite: z.boolean(),
  })
  .strict();

const toggleFavoriteResultSchema = openApiRegistry.register(
  "ToggleFavoriteResponse",
  toggleFavoriteResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: "/posts/{postId}/favorites",
  tags: ["Telegram Posts"],
  summary: "Toggle post favorite",
  description:
    "Adds the post to the authenticated user's favorites if it is not there yet, otherwise removes it and returns whether the post is now in favorites.",
  request: {
    headers: authHeaderSchema,
    params: toggleFavoriteParamsOpenApiSchema,
  },
  responses: {
    200: {
      description: "Favorite state was updated successfully.",
      content: {
        "application/json": {
          schema: toggleFavoriteResultSchema,
        },
      },
    },
    400: {
      description: "Route params validation failed.",
    },
    401: {
      description: "Authentication is required.",
    },
    404: {
      description: "Post was not found.",
    },
  },
});

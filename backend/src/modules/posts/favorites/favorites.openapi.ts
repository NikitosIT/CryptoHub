import { z } from "zod";

import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";

import { openApiRegistry } from "../../../openapi/registry.js";
import { toggleFavoriteBodySchema } from "./favorites.schema.js";

const authHeaderSchema = z.object({
  authorization: z.string().min(1).openapi({
    description: "Bearer token returned by the sign-in endpoint.",
    example: "Bearer your-auth-token",
  }),
});

const toggleFavoriteResponseSchema = z
  .object({
    isFavorite: z.boolean(),
    favoritesCount: z.number().int().nonnegative(),
  })
  .strict();

const toggleFavoriteRequestSchema = openApiRegistry.register(
  "ToggleFavoriteRequest",
  toggleFavoriteBodySchema,
);

const toggleFavoriteResultSchema = openApiRegistry.register(
  "ToggleFavoriteResponse",
  toggleFavoriteResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: `${API_ROUTE_SEGMENTS.posts}${API_ROUTE_SEGMENTS.favorites}`,
  tags: ["Telegram Posts"],
  summary: "Toggle post favorite",
  description:
    "Adds the post to the authenticated user's favorites if it is not there yet, otherwise removes it and returns the updated favorite state.",
  request: {
    headers: authHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: toggleFavoriteRequestSchema,
        },
      },
    },
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
      description: "Request body validation failed.",
    },
    401: {
      description: "Authentication is required.",
    },
  },
});

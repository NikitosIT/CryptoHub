import type { Request } from "express";

import type { ToggleFavoriteBody } from "./favorites.schema.js";

export type ToggleFavoriteParams = {
  userId: string;
  postId: number;
};

export type ToggleFavoriteResponse = {
  isFavorite: boolean;
  favoritesCount: number;
};

export type ToggleFavoriteRequest = Request<
  Record<string, never>,
  ToggleFavoriteResponse,
  ToggleFavoriteBody
>;

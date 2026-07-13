import type { Request } from "express";

export type ToggleFavoriteParams = {
  userId: string;
  postId: number;
};

export type ToggleFavoriteResponse = {
  isFavorite: boolean;
};

export type ToggleFavoriteRequest = Request<
  { postId: string },
  ToggleFavoriteResponse
>;

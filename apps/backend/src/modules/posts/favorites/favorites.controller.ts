import type { Response } from "express";

import { favoriteService } from "./favorites.service.js";
import type {
  ToggleFavoriteRequest,
  ToggleFavoriteResponse,
} from "./favorites.types.js";

export const toggleFavoriteController = async (
  req: ToggleFavoriteRequest,
  res: Response<ToggleFavoriteResponse>,
) => {
  const postId = Number(req.params.postId);
  const userId = req.user!.id;
  const result = await favoriteService.toggle({
    postId,
    userId,
  });

  res.json(result);
};

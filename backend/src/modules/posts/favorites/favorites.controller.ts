import type { Response } from "express";

import { toggleService } from "./favorites.service.js";
import type {
  ToggleFavoriteRequest,
  ToggleFavoriteResponse,
} from "./favorites.types.js";

export const toggleFavoriteController = async (
  req: ToggleFavoriteRequest,
  res: Response<ToggleFavoriteResponse>,
) => {
  const { postId } = req.body;
  const userId = req.user!.id;
  const result = await toggleService.favorite({
    postId,
    userId,
  });

  res.json(result);
};

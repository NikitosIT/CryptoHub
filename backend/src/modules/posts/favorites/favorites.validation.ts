import type { NextFunction, Response } from "express";

import { toggleFavoriteParamsSchema } from "./favorites.schema.js";
import type { ToggleFavoriteRequest } from "./favorites.types.js";

export const validateToggleFavorite = (
  req: ToggleFavoriteRequest,
  _res: Response,
  next: NextFunction,
) => {
  toggleFavoriteParamsSchema.parse(req.params);
  next();
};

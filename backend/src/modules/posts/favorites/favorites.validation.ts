import type { NextFunction, Response } from "express";

import { toggleFavoriteBodySchema } from "./favorites.schema.js";
import type { ToggleFavoriteRequest } from "./favorites.types.js";

export const validateToggleFavorite = (
  req: ToggleFavoriteRequest,
  _res: Response,
  next: NextFunction,
) => {
  req.body = toggleFavoriteBodySchema.parse(req.body);
  next();
};

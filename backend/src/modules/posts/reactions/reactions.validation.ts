import type { NextFunction, Response } from "express";

import {
  toggleReactionBodySchema,
  toggleReactionParamsSchema,
} from "./reactions.schema.js";
import type { ToggleReactionRequest } from "./reactions.types.js";

export const validateToggleReaction = (
  req: ToggleReactionRequest,
  _res: Response,
  next: NextFunction,
): void => {
  toggleReactionParamsSchema.parse(req.params);
  req.body = toggleReactionBodySchema.parse(req.body);

  next();
};

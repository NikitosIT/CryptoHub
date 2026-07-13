import type { NextFunction, Response } from "express";

import { chatStreamBodySchema } from "./crypto-ai.schema.js";
import type { ChatStreamRequest } from "./crypto-ai.types.js";

export const validateChatStream = (
  req: ChatStreamRequest,
  _res: Response,
  next: NextFunction,
): void => {
  req.body = chatStreamBodySchema.parse(req.body);

  next();
};

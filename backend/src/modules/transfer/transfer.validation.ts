import type { NextFunction, Request, Response } from "express";

import { transferBodySchema } from "./transfer.schema.js";

export const validateTransfer = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.body = transferBodySchema.parse(req.body);

  next();
};

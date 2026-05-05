import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { logger } from "@/libs/logger.js";

const REQUEST_ID_HEADER = "X-Request-Id";

const getRequestId = (req: Request) => {
  const incomingRequestId = req.get(REQUEST_ID_HEADER)?.trim();

  return incomingRequestId && incomingRequestId.length > 0
    ? incomingRequestId
    : randomUUID();
};

export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = getRequestId(req);

  req.requestId = requestId;
  req.log = logger.child({ requestId });

  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};

import type { NextFunction, Response } from "express";

import {
  createCommentBodySchema,
  createCommentParamsSchema,
  deleteCommentParamsSchema,
  listCommentsParamsSchema,
  listCommentsQuerySchema,
  updateCommentBodySchema,
  updateCommentParamsSchema,
} from "./comments.schema.js";
import type {
  CreateCommentRequest,
  DeleteCommentRequest,
  ListCommentsRequest,
  UpdateCommentRequest,
} from "./comments.types.js";

export const validateListComments = (
  req: ListCommentsRequest,
  _res: Response,
  next: NextFunction,
): void => {
  listCommentsParamsSchema.parse(req.params);
  req.query = listCommentsQuerySchema.parse(req.query);

  next();
};

export const validateCreateComment = (
  req: CreateCommentRequest,
  _res: Response,
  next: NextFunction,
): void => {
  createCommentParamsSchema.parse(req.params);
  req.body = createCommentBodySchema.parse(req.body);

  next();
};

export const validateUpdateComment = (
  req: UpdateCommentRequest,
  _res: Response,
  next: NextFunction,
): void => {
  updateCommentParamsSchema.parse(req.params);
  req.body = updateCommentBodySchema.parse(req.body);

  next();
};

export const validateDeleteComment = (
  req: DeleteCommentRequest,
  _res: Response,
  next: NextFunction,
): void => {
  deleteCommentParamsSchema.parse(req.params);

  next();
};

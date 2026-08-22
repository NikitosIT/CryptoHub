import type { Response } from "express";

import type { PaginatedResult } from "@/modules/paginate/paginate.types.js";

import { commentsService } from "./comments.service.js";
import type {
  CommentResponse,
  CreateCommentRequest,
  DeleteCommentRequest,
  ListCommentsRequest,
  UpdateCommentRequest,
} from "./comments.types.js";

export const listCommentsController = async (
  req: ListCommentsRequest,
  res: Response<PaginatedResult<CommentResponse>>,
) => {
  const result = await commentsService.list({
    postId: Number(req.params.postId),
    cursor: req.query.cursor,
  });

  res.json(result);
};

export const createCommentController = async (
  req: CreateCommentRequest,
  res: Response<CommentResponse>,
) => {
  const postId = Number(req.params.postId);
  const userId = req.user!.id;
  const result = await commentsService.create({
    userId,
    postId,
    parentCommentId: req.body.parentCommentId,
    text: req.body.text,
    media: req.body.media,
  });

  res.status(201).json(result);
};

export const updateCommentController = async (
  req: UpdateCommentRequest,
  res: Response<CommentResponse>,
) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const userId = req.user!.id;
  const result = await commentsService.update({
    userId,
    postId,
    commentId,
    text: req.body.text,
    media: req.body.media,
  });

  res.json(result);
};

export const deleteCommentController = async (
  req: DeleteCommentRequest,
  res: Response,
) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const userId = req.user!.id;

  await commentsService.remove({
    userId,
    postId,
    commentId,
  });

  res.status(204).send();
};

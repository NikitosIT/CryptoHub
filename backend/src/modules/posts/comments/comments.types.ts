import type { Request } from "express";

import type { PaginatedResult } from "@/modules/paginate/paginate.types.js";

import type { CommentResponse } from "./comments.prisma.js";
import type {
  CommentMediaInput,
  CreateCommentBody,
  ListCommentsQuery,
  UpdateCommentBody,
} from "./comments.schema.js";

export type { CommentResponse } from "./comments.prisma.js";

type PostParams = {
  postId: string;
};

type CommentParams = {
  postId: string;
  commentId: string;
};

export type ListCommentsRequest = Request<
  PostParams,
  PaginatedResult<CommentResponse>,
  unknown,
  ListCommentsQuery
>;

export type CreateCommentRequest = Request<
  PostParams,
  CommentResponse,
  CreateCommentBody
>;

export type UpdateCommentRequest = Request<
  CommentParams,
  CommentResponse,
  UpdateCommentBody
>;

export type DeleteCommentRequest = Request<CommentParams, void>;

type CommentServiceParams = {
  userId: string;
  postId: number;
};

export type ListCommentsInput = {
  postId: number;
  cursor?: number;
};

export type CreateCommentParams = CommentServiceParams & {
  parentCommentId?: number | null;
  text?: string;
  media?: CommentMediaInput[];
};

export type UpdateCommentParams = CommentServiceParams & {
  commentId: number;
  text?: string;
  media?: CommentMediaInput[];
};

export type DeleteCommentParams = CommentServiceParams & {
  commentId: number;
};

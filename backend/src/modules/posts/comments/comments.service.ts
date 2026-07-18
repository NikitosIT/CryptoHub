import { prisma } from "@/libs/db.js";
import { paginate } from "@/modules/paginate/paginate.service.js";
import type { PaginatedResult } from "@/modules/paginate/paginate.types.js";
import { AppError } from "@/utils/AppError.js";

import type { CommentResponse } from "./comments.prisma.js";
import { commentSelect } from "./comments.prisma.js";
import type {
  CreateCommentParams,
  DeleteCommentParams,
  ListCommentsInput,
  UpdateCommentParams,
} from "./comments.types.js";

const list = async ({
  postId,
  cursor,
}: ListCommentsInput): Promise<PaginatedResult<CommentResponse>> => {
  const post = await prisma.telegramPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return paginate<CommentResponse>({
    query: (paginationArgs) =>
      prisma.postComment.findMany({
        ...paginationArgs,
        where: { postId },
        select: commentSelect,
        orderBy: { id: "asc" },
      }),
    cursor,
    limit: 20,
  });
};

const create = async ({
  userId,
  postId,
  parentCommentId,
  text,
  media,
}: CreateCommentParams): Promise<CommentResponse> => {
  const comment = await prisma.$transaction(async (tx) => {
    const post = await tx.telegramPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (parentCommentId) {
      const parentComment = await tx.postComment.findUnique({
        where: { id: parentCommentId },
        select: { postId: true },
      });

      if (parentComment?.postId !== postId) {
        throw new AppError("Parent comment not found", 404);
      }
    }

    const createdComment = await tx.postComment.create({
      data: {
        userId,
        postId,
        parentCommentId: parentCommentId ?? null,
        text: text ?? "",
        media: media?.length
          ? {
              create: media,
            }
          : undefined,
      },
      select: commentSelect,
    });

    await tx.telegramPost.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    return createdComment;
  });

  return comment;
};

const update = async ({
  userId,
  postId,
  commentId,
  text,
  media,
}: UpdateCommentParams): Promise<CommentResponse> => {
  const comment = await prisma.$transaction(async (tx) => {
    const existingComment = await tx.postComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        userId: true,
        text: true,
      },
    });

    if (existingComment?.postId !== postId) {
      throw new AppError("Comment not found", 404);
    }

    if (existingComment.userId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    const nextText = text ?? existingComment.text;

    if (!nextText && media?.length === 0) {
      throw new AppError("Comment must have text or media", 400);
    }
    ///add ecisting media check

    return tx.postComment.update({
      where: { id: commentId },
      data: {
        ...(text !== undefined ? { text } : {}),
        ...(media !== undefined
          ? {
              media: {
                deleteMany: {},
                ...(media.length ? { create: media } : {}),
              },
            }
          : {}),
      },
      select: commentSelect,
    });
  });

  return comment;
};

const remove = async ({
  userId,
  postId,
  commentId,
}: DeleteCommentParams): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const existingComment = await tx.postComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        userId: true,
      },
    });

    if (existingComment?.postId !== postId) {
      throw new AppError("Comment not found", 404);
    }

    if (existingComment.userId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    await tx.postComment.delete({
      where: { id: commentId },
    });

    const commentsCount = await tx.postComment.count({
      where: { postId },
    });

    await tx.telegramPost.update({
      where: { id: postId },
      data: { commentsCount },
    });
  });
};

export const commentsService = {
  create,
  list,
  remove,
  update,
};

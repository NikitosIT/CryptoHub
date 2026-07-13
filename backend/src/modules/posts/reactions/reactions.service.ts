import { prisma } from "@/libs/db.js";
import { AppError } from "@/utils/AppError.js";

import type {
  ToggleReactionParams,
  ToggleReactionResponse,
} from "./reactions.types.js";

const toggle = async ({
  userId,
  postId,
  reactionType,
}: ToggleReactionParams): Promise<ToggleReactionResponse> => {
  return prisma.$transaction(async (tx) => {
    const post = await tx.telegramPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const reactionUniqueWhere = {
      userId_postId: {
        userId,
        postId,
      },
    };

    const existingReaction = await tx.postReaction.findUnique({
      where: reactionUniqueWhere,
    });

    if (!existingReaction) {
      await tx.postReaction.create({
        data: {
          userId,
          postId,
          reactionType,
        },
      });

      const updatedPost = await tx.telegramPost.update({
        where: { id: postId },
        data:
          reactionType === "LIKE"
            ? { likeCount: { increment: 1 } }
            : { dislikeCount: { increment: 1 } },
        select: {
          likeCount: true,
          dislikeCount: true,
        },
      });

      return {
        postId,
        status: reactionType === "LIKE" ? "liked" : "disliked",
        likeCount: updatedPost.likeCount,
        dislikeCount: updatedPost.dislikeCount,
      };
    }

    if (existingReaction.reactionType === reactionType) {
      await tx.postReaction.delete({
        where: reactionUniqueWhere,
      });

      const updatedPost = await tx.telegramPost.update({
        where: { id: postId },
        data:
          reactionType === "LIKE"
            ? { likeCount: { decrement: 1 } }
            : { dislikeCount: { decrement: 1 } },
        select: {
          likeCount: true,
          dislikeCount: true,
        },
      });

      return {
        postId,
        status: null,
        likeCount: updatedPost.likeCount,
        dislikeCount: updatedPost.dislikeCount,
      };
    }

    await tx.postReaction.update({
      where: reactionUniqueWhere,
      data: {
        reactionType,
      },
    });

    const updatedPost = await tx.telegramPost.update({
      where: { id: postId },
      data:
        reactionType === "LIKE"
          ? {
              likeCount: { increment: 1 },
              dislikeCount: { decrement: 1 },
            }
          : {
              likeCount: { decrement: 1 },
              dislikeCount: { increment: 1 },
            },
      select: {
        likeCount: true,
        dislikeCount: true,
      },
    });

    return {
      postId,
      status: reactionType === "LIKE" ? "liked" : "disliked",
      likeCount: updatedPost.likeCount,
      dislikeCount: updatedPost.dislikeCount,
    };
  });
};

export const reactionService = {
  toggle,
};

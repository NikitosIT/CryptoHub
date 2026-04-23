import { Request, Response } from "express";

import { prisma } from "@/shared/config/db.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { ToggleReaction } from "@/shared/validators/validator.js";

export const toggleReactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, post_id, reaction_type } = ToggleReaction.parse(req.body);
    // Todo get userId from auth that front dont send it

    const existing = await prisma.postReaction.findUnique({
      where: {
        userId_postId: {
          userId: user_id,
          postId: post_id,
        },
      },
    });

    if (!existing) {
      await prisma.postReaction.create({
        data: {
          userId: user_id,
          postId: post_id,
          reactionType: reaction_type,
        },
      });
    } else if (existing.reactionType === reaction_type) {
      await prisma.postReaction.delete({
        where: {
          userId_postId: {
            userId: user_id,
            postId: post_id,
          },
        },
      });
    } else {
      await prisma.postReaction.update({
        where: {
          userId_postId: {
            userId: user_id,
            postId: post_id,
          },
        },
        data: {
          reactionType: reaction_type,
        },
      });
    }

    const reactions = await prisma.postReaction.findMany({
      where: { postId: post_id },
      select: { reactionType: true },
    });

    const likeCount = reactions.filter((r) => r.reactionType === "LIKE").length;
    const dislikeCount = reactions.filter(
      (r) => r.reactionType === "DISLIKE",
    ).length;
    //Todo understand how count update after reaction

    await prisma.telegramPost.update({
      where: { id: post_id },
      data: {
        likeCount,
        dislikeCount,
      },
    });

    return res.json({
      success: true,
      post_id,
      likeCount,
      dislikeCount,
    });
  },
);

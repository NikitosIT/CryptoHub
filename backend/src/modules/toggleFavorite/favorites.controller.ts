import { Request, Response } from "express";

import { prisma } from "@/shared/config/db.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { ToggleFavoriteSchema } from "@/shared/validators/validator.js";

export const toggleFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, post_id } = ToggleFavoriteSchema.parse(req.body);
    // Todo get userId from auth that front dont send it

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: user_id,
          postId: post_id,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_postId: {
            userId: user_id,
            postId: post_id,
          },
        },
      });
      return res.json({
        success: true,
        status: "removed",
      });
    }

    await prisma.favorite.create({
      data: {
        userId: user_id,
        postId: post_id,
      },
    });
    return res.json({
      success: true,
      status: "added",
      is_favorite: true,
    });
  },
);

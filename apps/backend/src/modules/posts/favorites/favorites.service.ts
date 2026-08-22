import { prisma } from "@/libs/db.js";
import { AppError } from "@/utils/AppError.js";

import type {
  ToggleFavoriteParams,
  ToggleFavoriteResponse,
} from "./favorites.types.js";

const toggle = async ({
  userId,
  postId,
}: ToggleFavoriteParams): Promise<ToggleFavoriteResponse> => {
  return prisma.$transaction(async (tx) => {
    const post = await tx.telegramPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const existing = await tx.postFavorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      await tx.postFavorite.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      await tx.telegramPost.update({
        where: { id: postId },
        data: {
          favoritesCount: {
            decrement: 1,
          },
        },
      });

      return {
        isFavorite: false,
      };
    }

    await tx.postFavorite.create({
      data: {
        userId,
        postId,
      },
    });

    await tx.telegramPost.update({
      where: { id: postId },
      data: {
        favoritesCount: {
          increment: 1,
        },
      },
    });

    return {
      isFavorite: true,
    };
  });
};
export const favoriteService = {
  toggle,
};

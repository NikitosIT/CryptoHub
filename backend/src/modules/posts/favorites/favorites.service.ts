import { prisma } from "@/libs/db.js";

import type {
  ToggleFavoriteParams,
  ToggleFavoriteResponse,
} from "./favorites.types.js";

const favorite = async ({
  userId,
  postId,
}: ToggleFavoriteParams): Promise<ToggleFavoriteResponse> => {
  return prisma.$transaction(async (tx) => {
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

      const post = await tx.telegramPost.update({
        where: { id: postId },
        data: {
          favoritesCount: {
            decrement: 1,
          },
        },
        select: {
          favoritesCount: true,
        },
      });

      return {
        isFavorite: false,
        favoritesCount: post.favoritesCount,
      };
    }

    await tx.postFavorite.create({
      data: {
        userId,
        postId,
      },
    });

    const post = await tx.telegramPost.update({
      where: { id: postId },
      data: {
        favoritesCount: {
          increment: 1,
        },
      },
      select: {
        favoritesCount: true,
      },
    });

    return {
      isFavorite: true,
      favoritesCount: post.favoritesCount,
    };
  });
};
export const toggleService = {
  favorite,
};

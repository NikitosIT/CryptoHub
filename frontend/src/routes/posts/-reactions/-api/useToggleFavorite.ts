import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import type { TelegramPost } from "@/types/db";
import { cancelDebounce, debounceAsync } from "@/utils/debounceAsync";

import { findPostInCache } from "../-utils/findPostInCache";
import { updatePostInCache } from "../-utils/updatePostinCache";

type FavoriteState = boolean;
const initialFavoriteMap = new Map<string, FavoriteState>();

function toggleFavorite(post: TelegramPost): TelegramPost {
  return {
    ...post,
    is_favorite: !post.is_favorite,
  };
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      userId,
    }: {
      postId: number;
      userId: string;
    }): Promise<void> => {
      const key = `favorite:${postId}:${userId}`;

      const initial = initialFavoriteMap.get(key) ?? false;

      const post = findPostInCache(queryClient, postId);
      if (!post) return Promise.resolve();

      const current = !!post.is_favorite;

      if (initial === current) {
        cancelDebounce(key);
        initialFavoriteMap.delete(key);
        return Promise.resolve();
      }

      return debounceAsync(
        key,
        async () => {
          await api.reactions.toggleFavorite(postId, userId);
          initialFavoriteMap.delete(key);
        },
        500,
      );
    },

    onMutate: ({ postId, userId }) => {
      const key = `favorite:${postId}:${userId}`;

      if (!initialFavoriteMap.has(key)) {
        const post = findPostInCache(queryClient, postId);
        initialFavoriteMap.set(key, !!post?.is_favorite);
      }

      updatePostInCache(queryClient, postId, toggleFavorite);
    },
  });
}

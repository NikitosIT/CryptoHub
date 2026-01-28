import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { cancelDebounce, debounceAsync } from "@/utils/debounceAsync";

import { toggleReaction } from "../-hooks/useToggleReactionHook";
import { findPostInCache } from "../-utils/findPostInCache";
import { updatePostInCache } from "../-utils/updatePostinCache";

type UserReaction = "like" | "dislike" | null;
const initialReactionMap = new Map<string, UserReaction>();

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      reactionType,
      userId,
    }: {
      postId: number;
      reactionType: "like" | "dislike";
      userId: string;
    }) => {
      const key = `${postId}:${userId}`;

      const initial = initialReactionMap.get(key) ?? null;

      const post = findPostInCache(queryClient, postId);
      if (!post) return Promise.resolve();

      const current = post.user_reaction;

      if (initial === current) {
        cancelDebounce(key);
        initialReactionMap.delete(key);
        return Promise.resolve();
      }

      return debounceAsync(
        key,
        async () => {
          await api.reactions.toggle({ postId, reactionType, userId });
          initialReactionMap.delete(key);
        },
        1500,
      );
    },

    onMutate: ({
      postId,
      reactionType,
      userId,
    }: {
      postId: number;
      reactionType: "like" | "dislike";
      userId: string;
    }) => {
      const key = `${postId}:${userId}`;

      if (!initialReactionMap.has(key)) {
        const post = findPostInCache(queryClient, postId);
        initialReactionMap.set(key, post?.user_reaction ?? null);
      }
      updatePostInCache(queryClient, postId, (post) =>
        toggleReaction(post, reactionType),
      );
    },
  });
}

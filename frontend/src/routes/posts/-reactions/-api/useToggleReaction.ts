import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { cancelDebounce, debounceAsync } from "@/utils/debounceAsync";

import { toggleReaction } from "../-hooks/useToggleReactionHook";
import { findPostInCache } from "../-utils/findPostInCache";
import { updatePostInCache } from "../-utils/updatePostinCache";

type UserReaction = "like" | "dislike" | null;
const initialReactionMap = new Map<string, UserReaction>();

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  const userId = user?.id;
  return useMutation({
    mutationFn: ({
      postId,
      reactionType,
    }: {
      postId: number;
      reactionType: "like" | "dislike";
    }) => {
      const key = `${postId}:${user?.id}`;

      const initial = initialReactionMap.get(key) ?? null;

      const post = findPostInCache(queryClient, postId);
      if (!post) return Promise.resolve();

      const current = post.user_reaction;

      if (initial === current) {
        cancelDebounce(key);
        initialReactionMap.delete(key);
        return Promise.resolve();
      }
      if (!userId) {
        return Promise.reject(new Error("User not authenticated"));
      }
      return debounceAsync(
        key,
        async () => {
          await api.reactions.toggle({ postId, reactionType });
          initialReactionMap.delete(key);
        },
        500,
      );
    },

    onMutate: ({
      postId,
      reactionType,
    }: {
      postId: number;
      reactionType: "like" | "dislike";
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

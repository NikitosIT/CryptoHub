import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { useToast } from "@/hooks/useToast";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { updateCommentInList } from "@/routes/posts/-comments/-utils/commentUtils";
import type { CommentWithReplies } from "@/types/db";
import { debounceAsync } from "@/utils/debounceAsync";
import { getErrorMessage } from "@/utils/errorUtils";

import { commentsListQueryKey } from "./useCommentList";

const initialCommentLikeByKey = new Map<string, boolean>();

function findCommentInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly unknown[],
  commentId: number,
): CommentWithReplies | null {
  const comments = queryClient.getQueryData<CommentWithReplies[]>(queryKey);
  if (!comments) return null;

  const comment = comments.find((c) => c.id === commentId);
  return comment || null;
}

export function useCommentToggleLike(postId: number) {
  const queryClient = useQueryClient();
  const { showError } = useToast();
  const { user } = useAuthState();
  const userId = user?.id;
  function debouncedToggleCommentLikeWithCheck(commentId: number) {
    const key = `like-comment:${commentId}:${userId}`;
    const queryKey = commentsListQueryKey(postId);

    return debounceAsync(
      key,
      async () => {
        const initial = initialCommentLikeByKey.get(key);
        const currentComment = findCommentInCache(
          queryClient,
          queryKey,
          commentId,
        );
        const current = currentComment
          ? !!currentComment.user_has_liked
          : false;

        if (initial === current) {
          initialCommentLikeByKey.delete(key);
          return { skipped: true as const };
        }

        const res = await api.reactions.toggleCommentsLike(commentId, userId);

        initialCommentLikeByKey.delete(key);
        return res;
      },
      1500,
    );
  }

  const mutation = useMutation({
    mutationFn: ({ commentId }: { commentId: number }) => {
      return debouncedToggleCommentLikeWithCheck(commentId);
    },

    onMutate: async ({ commentId }: { commentId: number }) => {
      if (userId) {
        return { previous: null, queryKey: null };
      }

      const queryKey = commentsListQueryKey(postId);
      const key = `like-comment:${commentId}:${userId}`;

      await queryClient.cancelQueries({
        queryKey: commentsListQueryKey(postId),
        exact: false,
      });

      const previousComments =
        queryClient.getQueryData<CommentWithReplies[]>(queryKey);

      const currentComment = findCommentInCache(
        queryClient,
        queryKey,
        commentId,
      );

      if (!currentComment) {
        return { previousComments, queryKey };
      }

      if (!initialCommentLikeByKey.has(key)) {
        initialCommentLikeByKey.set(key, !!currentComment.user_has_liked);
      }

      const currentlyLiked = !!currentComment.user_has_liked;
      const newLikeCount = Math.max(
        currentComment.like_count + (currentlyLiked ? -1 : 1),
        0,
      );

      queryClient.setQueriesData<CommentWithReplies[]>(
        { queryKey: commentsListQueryKey(postId) },
        (old) => {
          if (!old) return old;

          return updateCommentInList(old, commentId, () => ({
            ...currentComment,
            user_has_liked: !currentlyLiked,
            like_count: newLikeCount,
          }));
        },
      );

      return { previousComments, queryKey };
    },

    onError: (err, _vars, onMutateReturn) => {
      if (onMutateReturn?.previousComments) {
        queryClient.setQueryData(
          onMutateReturn.queryKey,
          onMutateReturn.previousComments,
        );
      }

      const errorMessage = getErrorMessage(
        err,
        "Failed to toggle like. Please try again later.",
      );
      showError(errorMessage);
    },
  });

  return mutation;
}

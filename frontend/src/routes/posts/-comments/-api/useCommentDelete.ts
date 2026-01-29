import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { useRequiredAuth } from "@/hooks/useRequiredAuth";
import { useToast } from "@/hooks/useToast";
import { removeCommentFromList } from "@/routes/posts/-comments/-utils/commentUtils";
import type { CommentWithReplies } from "@/types/db";
import { getErrorMessage } from "@/utils/errorUtils";

import {
  commentsListQueryKey,
  getPreviousCommentsList,
} from "./useCommentList";
import { useCommentsUpdateCountCache } from "./useCommentsUpdateCountCache";

type DeleteCommentVariables = {
  commentId: number;
  postId: number;
};

type MutationContext = {
  previousComments: CommentWithReplies[] | undefined;
  queryKey: readonly ["comments", number];
};

export function useCommentDelete() {
  const queryClient = useQueryClient();
  const { user } = useRequiredAuth();
  const userId = user.id;
  const updateCommentsCount = useCommentsUpdateCountCache();
  const { showError } = useToast();
  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentVariables) =>
      api.comments.delete(commentId, userId),

    onMutate: async ({ commentId, postId }): Promise<MutationContext> => {
      const queryKey = commentsListQueryKey(postId);

      await queryClient.cancelQueries({ queryKey });

      const previousComments = getPreviousCommentsList(queryClient, postId);

      queryClient.setQueriesData<CommentWithReplies[]>({ queryKey }, (old) =>
        old ? removeCommentFromList(old, commentId) : old,
      );

      return { previousComments, queryKey };
    },

    onError: (err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(context.queryKey, context.previousComments);
      }

      showError(
        getErrorMessage(
          err,
          "Failed to delete comment. Please try again later.",
        ),
      );
    },

    onSuccess: (_data, { postId }) => {
      updateCommentsCount.mutate({ postId, delta: -1 });
    },
  });
}

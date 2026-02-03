import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api, type UserProfile } from "@/api";
import { useToast } from "@/hooks/useToast";
import { organizeComments } from "@/routes/posts/-comments/-utils/commentUtils";
import type { CommentWithReplies } from "@/types/db";
import { getErrorMessage } from "@/utils/errorUtils";

import { createBlobMediaFromFiles } from "../-utils/commentMediaUtils";
import {
  commentsListQueryKey,
  getPreviousCommentsList,
} from "./useCommentList";
import { useCommentsUpdateCountCache } from "./useCommentsUpdateCountCache";
import { uploadCommentMedia } from "./useUploadMedia";
type CommentVariables = {
  postId: number;
  commentId?: number;
  text: string;
  userId: string;
  parentCommentId?: number | null;
  mediaFiles?: File[];
};

type MutationContext = {
  previousComments: CommentWithReplies[] | undefined;
  queryKey: readonly ["comments", number];
  blobUrls: string[];
  optimisticCommentId: number;
};

export function useCommentCreate() {
  const queryClient = useQueryClient();
  const updateCommentsCount = useCommentsUpdateCountCache();
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({
      postId,
      text,
      parentCommentId,
      mediaFiles,
    }: CommentVariables) => {
      const uploadedMedia = await uploadCommentMedia({ mediaFiles });

      return api.comments.create({
        postId,
        text,
        parentCommentId,
        media: uploadedMedia.length > 0 ? uploadedMedia : null,
      });
    },

    onMutate: async ({
      postId,
      text,
      userId,
      parentCommentId,
      mediaFiles,
    }): Promise<MutationContext> => {
      const queryKey = commentsListQueryKey(postId);

      await queryClient.cancelQueries({ queryKey });

      const previousComments = getPreviousCommentsList(queryClient, postId);
      const profile = queryClient.getQueryData<UserProfile>(["profile"]);
      const { media: optimisticMedia, blobUrls } =
        createBlobMediaFromFiles(mediaFiles);

      const optimisticCommentId = Date.now();
      const optimisticComment: CommentWithReplies = {
        id: optimisticCommentId,
        user_id: userId,
        post_id: postId,
        parent_comment_id: parentCommentId ?? null,
        text,
        media: optimisticMedia.length > 0 ? optimisticMedia : null,
        like_count: 0,
        user_has_liked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          raw_user_meta_data: {
            nickname: profile?.nickname ?? null,
            avatar_url: profile?.profile_logo ?? null,
          },
        },
        replies: [],
      };

      queryClient.setQueriesData<CommentWithReplies[]>({ queryKey }, (old) => {
        if (!old) return [optimisticComment];
        return organizeComments([...old, optimisticComment]);
      });

      setTimeout(() => {
        const element = document.getElementById(
          `comment-${optimisticComment.id}`,
        );
        if (element) {
          element.scrollIntoView({
            behavior: "auto",
            block: "center",
          });
        }
      }, 0);

      return { previousComments, queryKey, blobUrls, optimisticCommentId };
    },

    onError: (err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(context.queryKey, context.previousComments);
      }
      context?.blobUrls.forEach((url) => URL.revokeObjectURL(url));

      showError(
        getErrorMessage(
          err,
          "Failed to create comment. Please try again later.",
        ),
      );
    },

    onSuccess: (response, { postId }, context) => {
      context.blobUrls.forEach((url) => URL.revokeObjectURL(url));

      if (response.success && response.data) {
        const realComment = response.data as CommentWithReplies;

        queryClient.setQueriesData<CommentWithReplies[]>(
          { queryKey: context.queryKey },
          (old) =>
            old?.map((comment) =>
              comment.id === context.optimisticCommentId
                ? { ...realComment, replies: comment.replies }
                : comment,
            ),
        );
      }

      updateCommentsCount.mutate({ postId, delta: 1 });
    },
  });
}

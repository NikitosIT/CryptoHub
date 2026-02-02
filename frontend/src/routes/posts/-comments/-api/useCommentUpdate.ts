import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { useToast } from "@/hooks/useToast";
import {
  createBlobMediaFromFiles,
  getExistingMedia,
} from "@/routes/posts/-comments/-utils/commentMediaUtils";
import { updateCommentInList } from "@/routes/posts/-comments/-utils/commentUtils";
import type { CommentMedia, CommentWithReplies } from "@/types/db";
import { getErrorMessage } from "@/utils/errorUtils";

import {
  commentsListQueryKey,
  getPreviousCommentsList,
} from "./useCommentList";
import { uploadCommentMedia } from "./useUploadMedia";

type UpdateCommentVariables = {
  commentId: number;
  text: string;
  postId: number;
  mediaFiles?: File[];
  existingMediaUrls?: string[];
};

type MutationContext = {
  previousComments: CommentWithReplies[] | undefined;
  queryKey: readonly ["comments", number];
  blobUrls: string[];
};

export function useCommentUpdate() {
  const queryClient = useQueryClient();

  const { showError } = useToast();
  const existingMediaRef = useRef<CommentMedia[]>([]);

  return useMutation({
    mutationFn: async ({
      commentId,
      text,
      mediaFiles,
    }: UpdateCommentVariables) => {
      const existingMedia = existingMediaRef.current;
      const newMedia = await uploadCommentMedia({ mediaFiles });
      const allMedia = [...existingMedia, ...newMedia];

      return api.comments.update({
        commentId,
        text,
        media: allMedia.length > 0 ? allMedia : null,
      });
    },

    onMutate: async ({
      commentId,
      text,
      postId,
      mediaFiles,
      existingMediaUrls,
    }): Promise<MutationContext> => {
      const queryKey = commentsListQueryKey(postId);
      await queryClient.cancelQueries({ queryKey });

      const previousComments = getPreviousCommentsList(queryClient, postId);

      const existingMedia = existingMediaUrls?.length
        ? getExistingMedia(previousComments, commentId, existingMediaUrls)
        : [];

      existingMediaRef.current = existingMedia;

      const { media: blobMedia, blobUrls } =
        createBlobMediaFromFiles(mediaFiles);
      const optimisticMedia = [...existingMedia, ...blobMedia];

      queryClient.setQueriesData<CommentWithReplies[]>({ queryKey }, (old) => {
        if (!old) return old;
        return updateCommentInList(old, commentId, (comment) => ({
          ...comment,
          text,
          media: optimisticMedia.length > 0 ? optimisticMedia : null,
          updated_at: new Date().toISOString(),
        }));
      });

      return { previousComments, queryKey, blobUrls };
    },

    onError: (err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(context.queryKey, context.previousComments);
      }
      context?.blobUrls.forEach((url) => URL.revokeObjectURL(url));

      showError(
        getErrorMessage(
          err,
          "Failed to update comment. Please try again later.",
        ),
      );
    },

    onSuccess: (_, __, context) => {
      context.blobUrls.forEach((url) => URL.revokeObjectURL(url));
    },
  });
}

import { type QueryClient, useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import type { Comment, CommentWithReplies } from "@/types/db";

import { organizeComments } from "../-utils/commentUtils";

interface UseListCommentsOptions {
  enabled?: boolean;
}

export const commentsListQueryKey = (postId: number) =>
  ["comments", postId] as const;

export function getPreviousCommentsList(
  queryClient: QueryClient,
  postId: number,
): CommentWithReplies[] | undefined {
  const queryKey = commentsListQueryKey(postId);
  return queryClient.getQueryData<CommentWithReplies[]>(queryKey);
}

async function fetchCommentsList(
  postId: number,
  userId?: string | null,
): Promise<CommentWithReplies[]> {
  const response = (await api.comments.list(postId, userId)) as {
    success: boolean;
    data: Comment[];
  };
  const comments = response.data;
  return organizeComments(comments);
}

export function useCommentsList(
  postId: number,
  options: UseListCommentsOptions = {},
) {
  const { user } = useAuthState({
    checkTwoFactor: true,
  });
  const { enabled = true } = options;

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: commentsListQueryKey(postId),
    queryFn: () => fetchCommentsList(postId, user?.id),
    enabled,
    staleTime: 60_000,
    gcTime: 2 * 60_000,
  });
}

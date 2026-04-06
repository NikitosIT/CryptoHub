import { type QueryClient, useQuery } from '@tanstack/react-query';

import { api } from '@/api';
import type { PostId } from '@/types/db';

import type { Comment, CommentWithReplies } from '../-types/comments-db';
import { organizeComments } from '../-utils/commentUtils';

interface UseListCommentsOptions {
  enabled?: boolean;
}

export const commentsListQueryKey = (postId: PostId) => ['comments', postId] as const;

export function getPreviousCommentsList(
  queryClient: QueryClient,
  postId: PostId,
): CommentWithReplies[] | undefined {
  const queryKey = commentsListQueryKey(postId);
  return queryClient.getQueryData<CommentWithReplies[]>(queryKey);
}

async function fetchCommentsList(postId: PostId): Promise<CommentWithReplies[]> {
  const response = (await api.comments.list(postId)) as {
    success: boolean;
    data: Comment[];
  };
  const comments = response.data;
  return organizeComments(comments);
}

export function useCommentsList(postId: PostId, options: UseListCommentsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: commentsListQueryKey(postId),
    queryFn: () => fetchCommentsList(postId),
    enabled,
    staleTime: 60_000,
    gcTime: 2 * 60_000,
  });
}

import type { QueryClient } from '@tanstack/react-query';

import type { commentsListQueryKey } from '../-api/useCommentList';
import type { CommentWithReplies } from '../-types';

export function findCommentInCache(
  queryClient: QueryClient,
  queryKey: ReturnType<typeof commentsListQueryKey>,
  commentId: number,
): CommentWithReplies | null {
  const comments = queryClient.getQueryData<CommentWithReplies[]>(queryKey);
  if (!comments) return null;

  const comment = comments.find((c) => c.id === commentId);
  return comment || null;
}

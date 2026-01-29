import type { useQueryClient } from "@tanstack/react-query";

import type { CommentWithReplies } from "@/types/db";

export function findCommentInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly unknown[],
  commentId: number,
): CommentWithReplies | null {
  const comments = queryClient.getQueryData<CommentWithReplies[]>(queryKey);
  if (!comments) return null;

  const comment = comments.find((c) => c.id === commentId);
  return comment || null;
}

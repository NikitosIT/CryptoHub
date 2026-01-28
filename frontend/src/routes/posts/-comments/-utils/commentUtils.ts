import type { Comment, CommentWithReplies } from "@/types/db";

export function organizeComments(comments: Comment[]): CommentWithReplies[] {
  return [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function buildParentMap(
  comments: CommentWithReplies[],
): Map<number, CommentWithReplies> {
  return new Map(comments.map((c) => [c.id, c]));
}

export function updateCommentInList(
  comments: CommentWithReplies[],
  commentId: number,
  updater: (comment: CommentWithReplies) => CommentWithReplies,
): CommentWithReplies[] {
  return comments.map((c) => (c.id === commentId ? updater(c) : c));
}

export function removeCommentFromList(
  comments: CommentWithReplies[],
  commentId: number,
): CommentWithReplies[] {
  return comments.filter((c) => c.id !== commentId);
}

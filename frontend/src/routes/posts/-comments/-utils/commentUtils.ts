import type { Comment, CommentWithReplies } from '../-types/comments-db';

export function organizeComments(comments: Comment[]) {
  return [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function buildParentMap(comments: CommentWithReplies[]) {
  return new Map(comments.map((c) => [c.id, c]));
}

export function updateCommentInList(
  comments: CommentWithReplies[],
  commentId: number,
  updater: (comment: CommentWithReplies) => CommentWithReplies,
) {
  return comments.map((c) => (c.id === commentId ? updater(c) : c));
}

export function removeCommentFromList(comments: CommentWithReplies[], commentId: number) {
  return comments.filter((c) => c.id !== commentId);
}

import type { CommentWithReplies } from "@/types/db";

export const MAX_COMMENT_LENGTH = 500;

export function getCommentPlaceholder(
  editingComment: CommentWithReplies | null,
  replyingTo: CommentWithReplies | null,
  replyingToUserName: string
): string {
  if (editingComment) {
    return "Editing comment...";
  }
  if (replyingTo) {
    return `Reply to ${replyingToUserName}...`;
  }
  return "Write a comment...";
}

import { createContext, useContext } from 'react';

import type { PostId } from '@/types';

import type { CommentWithReplies } from '../-types';

type CommentContextType = {
  postId: PostId;
  handleSubmit: (text: string, mediaFiles?: File[], existingMediaUrls?: string[]) => void;
  replyingTo: CommentWithReplies | null;
  cancelReply: () => void;
  editingComment: CommentWithReplies | null;
  cancelEdit: () => void;
  deletingCommentId: number | null;
  handleDeleteClick: (commentId: number) => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
  handleJumpToComment: (commentId: number) => void;
  handleReplyClick: (comment: CommentWithReplies) => void;
  handleEditClick: (comment: CommentWithReplies) => void;
  highlightedCommentId: number | null;
};

export const CommentsContext = createContext<CommentContextType | null>(null);

export const useCommentContext = () => {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error('useCommentsContext must be used inside CommentsProvider');
  }

  return ctx;
};

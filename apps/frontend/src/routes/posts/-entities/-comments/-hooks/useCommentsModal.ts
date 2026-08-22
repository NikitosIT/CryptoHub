import { useEffect, useState } from 'react';

import { useAuthState } from '@/routes/auth/-hooks/useAuthState';

import { useCommentCreate } from '../-api/useCommentCreate';
import { useCommentDelete } from '../-api/useCommentDelete';
import { useCommentUpdate } from '../-api/useCommentUpdate';
import type { CommentWithReplies } from '../-types';

export function useCommentsModal(postId: number) {
  const [replyingTo, setReplyingTo] = useState<CommentWithReplies | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithReplies | null>(null);

  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<number | null>(null);

  const createComment = useCommentCreate();
  const updateComment = useCommentUpdate();
  const deleteComment = useCommentDelete();

  const { user } = useAuthState();
  const currentUserId = user?.id;

  const handleJumpToComment = (commentId: number) => {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setHighlightedCommentId(commentId);
    }
  };

  const handleSubmit = (
    text: string,
    mediaFiles?: File[],
    existingMediaUrls?: string[],
  ) => {
    if (!currentUserId) {
      return;
    }

    const hasContent = Boolean(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      text.trim() || mediaFiles?.length || existingMediaUrls?.length,
    );

    if (!hasContent) {
      return;
    }

    if (editingComment) {
      const commentId = editingComment.id;
      setEditingComment(null);
      updateComment.mutate({
        commentId,
        text: text.trim(),
        postId,
        mediaFiles,
        existingMediaUrls,
      });
    } else {
      setReplyingTo(null);
      createComment.mutate({
        postId,
        text: text.trim(),
        userId: currentUserId,
        parentCommentId: replyingTo?.id ?? null,
        mediaFiles,
      });
    }
  };

  const handleReplyClick = (comment: CommentWithReplies) => {
    setReplyingTo(comment);
    setEditingComment(null);
  };

  const handleEditClick = (comment: CommentWithReplies) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
  };

  const handleDeleteClick = (commentId: number) => {
    setDeletingCommentId(commentId);
  };

  const handleDeleteConfirm = () => {
    if (deletingCommentId !== null) {
      deleteComment.mutate({
        commentId: deletingCommentId,
        postId,
      });
      setDeletingCommentId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCommentId(null);
  };

  useEffect(() => {
    if (highlightedCommentId !== null) {
      const timer = setTimeout(() => {
        setHighlightedCommentId(null);
      }, 350);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [highlightedCommentId]);

  return {
    replyingTo,
    editingComment,
    deletingCommentId,
    handleSubmit,
    handleReplyClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    cancelReply,
    cancelEdit,
    handleJumpToComment,
    highlightedCommentId,
  };
}

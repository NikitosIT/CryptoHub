import { useEffect, useState } from "react";

import { useCommentCreate } from "@/routes/posts/-comments/-api/useCommentCreate";
import { useCommentUpdate } from "@/routes/posts/-comments/-api/useCommentUpdate";
import type { CommentWithReplies } from "@/types/db";

interface UseCommentsModalProps {
  postId: number;
  currentUserId: string | undefined;
}

export function useCommentsModal({
  postId,
  currentUserId,
}: UseCommentsModalProps) {
  const [replyingTo, setReplyingTo] = useState<CommentWithReplies | null>(null);
  const [editingComment, setEditingComment] =
    useState<CommentWithReplies | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    number | null
  >(null);

  const createComment = useCommentCreate();
  const updateComment = useCommentUpdate();

  const handleJumpToComment = (commentId: number) => {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedCommentId(commentId);
    }
  };

  const handleSubmit = (
    text: string,
    mediaFiles?: File[],
    existingMediaUrls?: string[]
  ) => {
    if (!currentUserId) {
      return;
    }

    const hasContent =
      text.trim() || mediaFiles?.length || existingMediaUrls?.length;
    if (!hasContent) {
      return;
    }

    if (editingComment) {
      const commentId = editingComment.id;
      setEditingComment(null);
      updateComment.mutate({
        commentId,
        text: text.trim(),
        userId: currentUserId,
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

  useEffect(() => {
    if (highlightedCommentId !== null) {
      const timer = setTimeout(() => {
        setHighlightedCommentId(null);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [highlightedCommentId]);

  return {
    replyingTo,
    editingComment,
    handleSubmit,
    handleReplyClick,
    handleEditClick,
    cancelReply,
    cancelEdit,
    handleJumpToComment,
    highlightedCommentId,
  };
}

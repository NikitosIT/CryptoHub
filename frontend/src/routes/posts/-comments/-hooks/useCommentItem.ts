import { useState } from "react";

import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useCommentDelete } from "@/routes/posts/-comments/-api/useCommentDelete";
import type { CommentWithReplies } from "@/types/db";

import { isCommentOwner } from "../-utils/commentItemUtils";

interface UseCommentItemProps {
  comment: CommentWithReplies;
  postId: number;
  onReplyClick?: (comment: CommentWithReplies) => void;
  onEditClick?: (comment: CommentWithReplies) => void;
}

export function useCommentItem({
  comment,
  postId,
  onReplyClick,
  onEditClick,
}: UseCommentItemProps) {
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const deleteComment = useCommentDelete();
  const { user } = useAuthState();
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setOpenDeleteDialog(false);
    deleteComment.mutate({
      commentId: comment.id,

      postId,
    });
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(comment.text || "");
  };

  const handleEdit = () => {
    onEditClick?.(comment);
  };

  const handleReply = () => {
    onReplyClick?.(comment);
  };

  const handleMediaClick = (mediaUrl: string, mediaType: "photo" | "video") => {
    if (mediaType === "photo") {
      setPreviewMedia(mediaUrl);
    }
  };

  const handleCloseMediaPreview = () => {
    setPreviewMedia(null);
  };

  const isOwner = user?.id ? isCommentOwner(comment, user.id) : false;

  return {
    previewMedia,
    openDeleteDialog,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCopy,
    handleEdit,
    handleReply,
    handleMediaClick,
    handleCloseMediaPreview,
    isOwner,
  };
}

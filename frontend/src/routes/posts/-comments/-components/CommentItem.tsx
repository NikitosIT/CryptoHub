import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

import { useCommentToggleLike } from "@/routes/posts/-comments/-api/useCommentToggleLike";
import { useCommentItem } from "@/routes/posts/-comments/-hooks/useCommentItem";
import {
  getCommentAvatarUrl,
  getCommentUserName,
} from "@/routes/posts/-comments/-utils/commentItemUtils";
import {
  commentDeleteDialogCancelButtonStyles,
  commentDeleteDialogContentStyles,
  commentDeleteDialogDeleteButtonStyles,
  commentDeleteDialogPaperStyles,
  commentDeleteDialogTitleStyles,
  getCommentItemStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import type { CommentWithReplies } from "@/types/db";

import { ImageModal } from "../../-components/ImageModal";
import { CommentActions } from "./CommentActions";
import { CommentAvatar } from "./CommentAvatar";
import { CommentContent } from "./CommentContent";
import { CommentHeader } from "./CommentHeader";
import { CommentParentContext } from "./CommentParentContext";

interface CommentItemProps {
  comment: CommentWithReplies;
  parentComment?: CommentWithReplies | null;
  postId: number;
  handleReplyClick: (comment: CommentWithReplies) => void;
  handleEditClick: (comment: CommentWithReplies) => void;
  handleJumpToComment: (commentId: number) => void;
  highlightedCommentId: number | null;
}

export function CommentItem({
  comment,
  parentComment,
  postId,
  handleReplyClick,
  handleEditClick,
  handleJumpToComment,
  highlightedCommentId,
}: CommentItemProps) {
  const {
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
  } = useCommentItem({
    comment,
    postId,
    onReplyClick: handleReplyClick,
    onEditClick: handleEditClick,
  });

  const toggleCommentLike = useCommentToggleLike(postId);

  const handleToggleLike = () => {
    toggleCommentLike.mutate({ commentId: comment.id });
  };

  const isReply = !!comment.parent_comment_id;
  const userName = getCommentUserName(comment);
  const avatarUrl = getCommentAvatarUrl(comment);
  const parentUserName = getCommentUserName(parentComment ?? null);
  const parentText = parentComment?.text || "";

  return (
    <>
      <Box
        id={`comment-${comment.id}`}
        sx={(theme) =>
          getCommentItemStyles(
            theme,
            isOwner,
            isReply,
            highlightedCommentId === comment.id,
          )
        }
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={{ xs: 0.75, sm: 0.875 }}
        >
          <CommentAvatar avatarUrl={avatarUrl} userName={userName} />

          <Box sx={{ flex: 1 }}>
            {comment.parent_comment_id && parentComment ? (
              <CommentParentContext
                parentCommentId={comment.parent_comment_id}
                parentUserName={parentUserName}
                parentText={parentText}
                parentMedia={parentComment.media}
                handleJumpToComment={handleJumpToComment}
              />
            ) : null}

            <CommentHeader
              userName={userName}
              isOwner={isOwner}
              createdAt={comment.created_at}
              updatedAt={comment.updated_at}
            />

            <CommentContent
              text={comment.text}
              media={comment.media}
              onMediaClick={handleMediaClick}
            />

            <CommentActions
              isOwner={isOwner}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onCopy={handleCopy}
              onToggleLike={handleToggleLike}
              likeCount={comment.like_count}
              userHasLiked={!!comment.user_has_liked}
            />
          </Box>
        </Stack>
      </Box>

      {previewMedia ? (
        <ImageModal url={previewMedia} onClose={handleCloseMediaPreview} />
      ) : null}

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: commentDeleteDialogPaperStyles }}
      >
        <DialogTitle sx={commentDeleteDialogTitleStyles}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={commentDeleteDialogContentStyles}>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={commentDeleteDialogCancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={commentDeleteDialogDeleteButtonStyles}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

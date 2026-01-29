import { forwardRef, useEffect } from "react";
import { RemoveScroll } from "react-remove-scroll";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";

import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useToast } from "@/hooks/useToast";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useCommentsList } from "@/routes/posts/-comments/-api/useCommentList";
import { useCommentsModal } from "@/routes/posts/-comments/-hooks/useCommentsModal";
import {
  commentModalActionsStyles,
  commentModalCloseButtonStyles,
  commentModalCloseIconStyles,
  commentModalContentStyles,
  commentModalEmptyTextStyles,
  commentModalLoadingContainerStyles,
  commentModalLoadingTextStyles,
  commentModalLoginTextStyles,
  commentModalPaperStyles,
  commentModalTitleStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import { buildParentMap } from "@/routes/posts/-comments/-utils/commentUtils";
import { getErrorMessage } from "@/utils/errorUtils";

import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";

const DialogTransition = forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => <Slide direction="up" ref={ref} {...props} />);

interface CommentsModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentModal({ postId, isOpen, onClose }: CommentsModalProps) {
  const { user } = useAuthState({
    checkTwoFactor: true,
  });

  const {
    data: comments,
    isLoading,
    error,
  } = useCommentsList(postId, {
    enabled: isOpen,
  });

  const { showError } = useToast();

  useEffect(() => {
    if (error && isOpen) {
      showError(
        getErrorMessage(
          error,
          "Failed to load comments. Please try again later.",
        ),
      );
    }
  }, [error, isOpen, showError]);

  const {
    replyingTo,
    editingComment,
    handleSubmit,
    handleReplyClick,
    handleEditClick,
    cancelReply,
    cancelEdit,
    handleJumpToComment,
    highlightedCommentId,
  } = useCommentsModal(postId);

  useEscapeKey(onClose);

  const parentMap = buildParentMap(comments ?? []);
  const hasComments = !isLoading && comments && comments.length > 0;
  const isEmpty = !isLoading && comments?.length === 0;

  return (
    <RemoveScroll enabled={isOpen}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        disableScrollLock
        keepMounted
        TransitionComponent={DialogTransition}
        PaperProps={{ sx: commentModalPaperStyles }}
        aria-labelledby="comments-dialog-title"
      >
        <DialogTitle id="comments-dialog-title" sx={commentModalTitleStyles}>
          Comments
          <IconButton
            onClick={onClose}
            aria-label="Close comments"
            size="small"
            sx={commentModalCloseButtonStyles}
          >
            <CloseIcon sx={commentModalCloseIconStyles} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={commentModalContentStyles}>
          {isLoading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={commentModalLoadingContainerStyles}
            >
              <CircularProgress size={24} />
              <Typography sx={commentModalLoadingTextStyles}>
                Loading comments…
              </Typography>
            </Stack>
          ) : null}

          {isEmpty ? (
            <Typography sx={commentModalEmptyTextStyles}>
              No comments yet. Be the first!
            </Typography>
          ) : null}

          {hasComments ? (
            <Stack spacing={{ xs: 1, sm: 1.25 }}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  parentComment={
                    parentMap.get(comment.parent_comment_id ?? -1) ?? null
                  }
                  postId={postId}
                  handleReplyClick={handleReplyClick}
                  handleEditClick={handleEditClick}
                  handleJumpToComment={handleJumpToComment}
                  highlightedCommentId={highlightedCommentId}
                />
              ))}
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={commentModalActionsStyles}>
          {user?.id ? (
            <CommentInput
              postId={postId}
              onSubmit={handleSubmit}
              replyingTo={replyingTo}
              onCancelReply={cancelReply}
              editingComment={editingComment}
              onCancelEdit={cancelEdit}
              handleJumpToComment={handleJumpToComment}
            />
          ) : (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography sx={commentModalLoginTextStyles}>
                Please log in to comment
              </Typography>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </RemoveScroll>
  );
}

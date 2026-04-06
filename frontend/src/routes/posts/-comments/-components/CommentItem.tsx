import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

import { useCommentItem } from '@/routes/posts/-comments/-hooks/useCommentItem';

import { ImageModal } from '../../-components/ImageModal';
import type { CommentWithReplies } from '../-types/comments-db';
import { CommentActions } from './CommentActions';
import { CommentAvatar } from './CommentAvatar';
import { CommentContent } from './CommentContent';
import { CommentHeader } from './CommentHeader';
import { CommentParentContext } from './CommentParentContext';
import { useCommentContext } from './comments-context';
interface CommentItemProps {
  comment: CommentWithReplies;
  parentComment?: CommentWithReplies | null;
}

export function CommentItem({ comment, parentComment }: CommentItemProps) {
  const { previewMedia, handleMediaClick, handleCloseMediaPreview, isOwner } =
    useCommentItem({
      comment,
    });

  const {
    highlightedCommentId,
    deletingCommentId,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useCommentContext();

  const isReply = !!comment.parent_comment_id;

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
        <Stack direction="row" alignItems="flex-start" spacing={{ xs: 0.75, sm: 0.875 }}>
          <CommentAvatar comment={comment} />

          <Box sx={{ flex: 1 }}>
            {comment.parent_comment_id && parentComment ? (
              <CommentParentContext comment={comment} parentComment={parentComment} />
            ) : null}

            <CommentHeader comment={comment} />

            <CommentContent comment={comment} onMediaClick={handleMediaClick} />

            <CommentActions comment={comment} />
          </Box>
        </Stack>
      </Box>

      {previewMedia ? (
        <ImageModal url={previewMedia} onClose={handleCloseMediaPreview} />
      ) : null}

      <Dialog
        open={deletingCommentId === comment.id}
        onClose={handleDeleteCancel}
        slotProps={{ paper: { sx: commentDeleteDialogPaperStyles } }}
      >
        <DialogTitle sx={commentDeleteDialogTitleStyles}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={commentDeleteDialogContentStyles}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={commentDeleteDialogCancelButtonStyles}>
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

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const getCommentItemStyles = (
  theme: Theme,
  isOwner: boolean,
  isReply: boolean,
  isJumpHighlighted: boolean,
) => {
  const isHighlighted = isOwner || isReply;
  return {
    width: 'fit-content',
    maxWidth: { xs: '90%', sm: '60%', md: '70%' },
    py: { xs: 0.5, sm: 0.625 },
    px: isHighlighted ? { xs: 0.5, sm: 0.625 } : 0,
    borderRadius: isHighlighted ? { xs: 1.25, sm: 1.5 } : 0,
    borderLeft: isOwner
      ? '2px solid'
      : isReply
        ? { xs: '1px solid', sm: '1.5px solid' }
        : 'none',
    borderLeftColor: isOwner
      ? theme.palette.primary.main
      : isReply
        ? theme.palette.grey[700]
        : 'transparent',
    bgcolor: isJumpHighlighted
      ? 'rgba(59, 130, 246, 0.2)'
      : isOwner
        ? alpha(theme.palette.primary.main, 0.08)
        : isReply
          ? alpha(theme.palette.grey[700], 0.15)
          : 'transparent',
    transition: 'background-color 1s ease',
    mx: isHighlighted ? { xs: -0.5, sm: -0.75 } : 0,
    mb: { xs: 1, sm: 1.25 },
    ...commentTextStyles,
  };
};

const commentDeleteDialogPaperStyles = {
  bgcolor: 'grey.900',
  color: 'common.white',
  border: '1px solid',
  borderColor: 'grey.800',
};

const commentDeleteDialogTitleStyles = {
  color: 'common.white',
  ...commentTextStyles,
};

const commentDeleteDialogContentStyles = {
  color: 'grey.400',
  ...commentTextStyles,
};

const commentDeleteDialogCancelButtonStyles = {
  color: 'grey.400',
  ...commentTextStyles,
  '&:hover': {
    bgcolor: 'grey.800',
  },
};

const commentDeleteDialogDeleteButtonStyles = {
  color: 'error.main',
  ...commentTextStyles,
  '&:hover': {
    bgcolor: 'error.dark',
  },
};

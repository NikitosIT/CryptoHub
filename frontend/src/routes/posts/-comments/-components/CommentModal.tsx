import { forwardRef, useEffect } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import CloseIcon from '@mui/icons-material/Close';
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
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useToast } from '@/hooks/useToast';
import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import { useCommentsList } from '@/routes/posts/-comments/-api/useCommentList';
import { useCommentsModal } from '@/routes/posts/-comments/-hooks/useCommentsModal';
import { buildParentMap } from '@/routes/posts/-comments/-utils/commentUtils';
import type { PostId } from '@/types';
import { getErrorMessage } from '@/utils/errorUtils';

import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { CommentsContext } from './comments-context';

const DialogTransition = forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => <Slide direction="up" ref={ref} {...props} />);

interface CommentsModalProps {
  postId: PostId;
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
        getErrorMessage(error, 'Failed to load comments. Please try again later.'),
      );
    }
  }, [error, isOpen, showError]);

  const commentModal = useCommentsModal(postId);

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
        slots={{ transition: DialogTransition }}
        slotProps={{
          paper: { sx: commentModalPaperStyles },
        }}
        aria-labelledby="comments-dialog-title"
      >
        <CommentsContext.Provider value={{ postId, ...commentModal }}>
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
                    parentComment={parentMap.get(comment.parent_comment_id ?? -1) ?? null}
                  />
                ))}
              </Stack>
            ) : null}
          </DialogContent>

          <DialogActions sx={commentModalActionsStyles}>
            {user?.id ? (
              <CommentInput />
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography sx={commentModalLoginTextStyles}>
                  Please log in to comment
                </Typography>
              </Box>
            )}
          </DialogActions>
        </CommentsContext.Provider>
      </Dialog>
    </RemoveScroll>
  );
}

const commentModalPaperStyles = {
  bgcolor: 'grey.900',
  color: 'common.white',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: { xs: '75vh', sm: '90vh', md: '85vh', lg: '80vh' },
  height: { xs: '75vh', sm: '90vh', md: '85vh', lg: '80vh' },
  margin: { xs: 'auto', sm: '32px', md: '48px', lg: '64px' },
  width: {
    xs: '100%',
    sm: '600px',
    md: '700px',
    lg: '800px',
    xl: '900px',
  },
  minWidth: { xs: '100%', sm: '600px', md: '700px' },
  maxWidth: {
    xs: '100%',
    sm: '600px',
    md: '700px',
    lg: '800px',
    xl: '900px',
  },
  borderRadius: { xs: '16px 16px 0 0', sm: 2 },
  position: { xs: 'absolute', sm: 'relative' },
  bottom: { xs: 0, sm: 'auto' },
  top: { xs: 'auto', sm: 'auto' },
};

const commentModalTitleStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: (theme: Theme) => `1px solid ${theme.palette.grey[800]}`,
  py: { xs: 1.5, sm: 2 },
  px: { xs: 2, sm: 3 },
  flexShrink: 0,
  minHeight: { xs: '56px', sm: '64px' },
};

const commentModalCloseButtonStyles = {
  color: 'grey.400',
  padding: { xs: 0.75, sm: 1 },
};

const commentModalCloseIconStyles = {
  fontSize: { xs: '20px', sm: '24px' },
};

const commentModalContentStyles = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  py: { xs: 1.5, sm: 3 },
  px: { xs: 1.5, sm: 3 },
  '&::-webkit-scrollbar': {
    width: { xs: '4px', sm: '6px' },
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

const commentModalLoadingContainerStyles = {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: { xs: 150, sm: 200 },
};

const commentModalLoadingTextStyles = {
  variant: 'body2',
  color: 'grey.500',
  fontSize: { xs: '13px', sm: '14px' },
};

const commentModalEmptyTextStyles = {
  variant: 'body2',
  color: 'grey.500',
  fontSize: { xs: '13px', sm: '14px' },
};

const commentModalActionsStyles = {
  display: 'block',
  px: 0,
  minHeight: { xs: 'auto', sm: 'auto' },
  flexShrink: 0,
  borderTop: (theme: Theme) => `1px solid ${theme.palette.grey[800]}`,
  bgcolor: 'grey.900',
};

const commentModalLoginTextStyles = {
  variant: 'body2',
  align: 'center',
  color: 'grey.500',
  fontSize: { xs: '13px', sm: '14px' },
};

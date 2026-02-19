import { Badge, Box, IconButton } from '@mui/material';

import type { TelegramPost } from '@/types/db';

import { useCommentsModalPersistence } from '../-store/useCommentsModalStore';
import { CommentModal } from './CommentModal';

interface CommentButtonProps {
  post: TelegramPost;
}

export function CommentOpenButton({ post }: CommentButtonProps) {
  const { isOpen, open, close } = useCommentsModalPersistence(post.id);
  const commentsCount = post.comments_count ?? 0;

  return (
    <>
      <IconButton
        onClick={open}
        aria-label={
          commentsCount > 0 ? `Open comments (${commentsCount})` : 'Open comments'
        }
        sx={commentOpenButtonStyles}
      >
        <Badge
          badgeContent={commentsCount}
          color="primary"
          overlap="circular"
          invisible={commentsCount === 0}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box component="img" src="/links_logo/comments.svg" alt="Comments" />
        </Badge>
      </IconButton>

      <CommentModal postId={post.id} isOpen={isOpen} onClose={close} />
    </>
  );
}

const commentOpenButtonStyles = {
  color: 'grey.400',
  transition: 'all 0.2s ease',
  '& img': {
    width: 30,
    height: 30,
    filter: 'brightness(0) saturate(100%) invert(60%)',
    transition: 'filter 0.2s ease',
  },
  '&:hover': {
    color: 'common.white',
    '& img': {
      filter: 'brightness(0) saturate(100%) invert(100%)',
    },
  },
};

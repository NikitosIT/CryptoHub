import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { Button, Stack } from '@mui/material';

import { useAuthState } from '@/routes/auth/-hooks/useAuthState';

import { useCommentToggleLike } from '../-api/useCommentToggleLike';
import type { CommentProps } from '../-types';
import { CommentActionsMenu } from './CommentActionsMenu';
import { useCommentContext } from './comments-context';

export function CommentActions({ comment }: CommentProps) {
  const { user } = useAuthState();
  const { postId, handleReplyClick } = useCommentContext();
  const toggleCommentLike = useCommentToggleLike(postId);
  const commentId = comment.id;
  const handleToggleLike = () => {
    toggleCommentLike.mutate({ commentId });
  };

  const likeCount = comment.like_count;
  const userHasLiked = !!comment.user_has_liked;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{ xs: 0.5, sm: 0.75 }}
      sx={{ mt: { xs: 0.375, sm: 0.5 } }}
    >
      <Button
        onClick={handleToggleLike}
        disabled={!user?.id}
        size="small"
        variant="text"
        startIcon={
          userHasLiked ? (
            <FavoriteIcon sx={{ fontSize: { xs: '16px', sm: '18px' } }} />
          ) : (
            <FavoriteBorderOutlinedIcon sx={{ fontSize: { xs: '16px', sm: '18px' } }} />
          )
        }
        sx={{
          ...commentActionsLikeButtonStyles,
          color: userHasLiked ? 'error.light' : 'grey.400',
          '&:hover': {
            color: userHasLiked ? 'error.main' : 'grey.200',
            backgroundColor: 'transparent',
          },
          '&.Mui-disabled': {
            color: 'grey.600',
          },
        }}
      >
        {likeCount}
      </Button>

      {user?.id ? (
        <Button
          onClick={() => handleReplyClick(comment)}
          variant="text"
          size="small"
          sx={commentActionsReplyButtonStyles}
        >
          Reply
        </Button>
      ) : null}
      <CommentActionsMenu comment={comment} />
    </Stack>
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const commentActionsLikeButtonStyles = {
  textTransform: 'none',
  fontSize: { xs: '11px', sm: '12px' },
  padding: { xs: '2px 6px', sm: '4px 6px' },
  minWidth: 'auto',
  fontWeight: 500,
  ...commentTextStyles,
};

const commentActionsReplyButtonStyles = {
  textTransform: 'none',
  color: 'grey.400',
  fontSize: { xs: '11px', sm: '12px' },
  padding: { xs: '2px 6px', sm: '4px 6px' },
  ...commentTextStyles,
  '&:hover': {
    color: 'primary.light',
    backgroundColor: 'transparent',
  },
};

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Linkify from 'linkify-react';

import { getCommentUserName } from '@/routes/posts/-comments/-utils/commentItemUtils';

import { CommentMediaThumbnails } from './CommentMediaThumbnails';
import { useCommentContext } from './comments-context';

export function CommentReplyPreview() {
  const { handleJumpToComment, cancelReply, replyingTo } = useCommentContext();
  if (!replyingTo) return null;
  const replyingToUserName = getCommentUserName(replyingTo);
  const replyingToText = replyingTo.text || '';
  const media = replyingTo.media;
  const hasMedia = media && media.length > 0;

  return (
    <Paper elevation={0} sx={replyPreviewPaperStyles}>
      <Stack direction="row" alignItems="flex-start" spacing={{ xs: 1, sm: 1.5 }}>
        <Box
          onClick={() => handleJumpToComment(replyingTo.id)}
          sx={commentPreviewClickableBoxStyles}
          title="Click to jump to original comment"
        >
          {hasMedia ? (
            <CommentMediaThumbnails media={media} maxThumbnails={3} size="medium" />
          ) : null}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography
                variant="caption"
                className="reply-preview-title"
                sx={commentPreviewTitleStyles}
              >
                Reply to {replyingToUserName}
              </Typography>
              {hasMedia ? (
                <Typography
                  variant="caption"
                  color="grey.500"
                  sx={commentPreviewMediaCountStyles}
                >
                  • {media.length} {media.length === 1 ? 'media item' : 'media items'}
                </Typography>
              ) : null}
            </Stack>
            {replyingToText ? (
              <Typography
                variant="caption"
                color="grey.200"
                sx={commentPreviewTextStyles}
                component="div"
              >
                <Linkify
                  options={{
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'comment-link',
                  }}
                >
                  {replyingToText}
                </Linkify>
              </Typography>
            ) : null}
          </Box>
        </Box>

        <IconButton
          onClick={cancelReply}
          aria-label="Cancel reply"
          size="small"
          sx={replyPreviewCancelButtonStyles}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const replyPreviewPaperStyles = {
  p: { xs: 1, sm: 1.5 },
  mb: { xs: 1.5, sm: 2 },
  borderLeft: { xs: '3px solid', sm: '4px solid' },
  borderColor: 'primary.main',
  bgcolor: 'grey.800',
  borderRadius: { xs: 1, sm: 1.5 },
};

const commentPreviewClickableBoxStyles = {
  display: 'flex',
  gap: 1,
  flex: 1,
  minWidth: 0,
  cursor: 'pointer',
  '&:hover .reply-preview-title': {
    color: 'primary.light',
  },
};

const commentPreviewTitleStyles = {
  fontWeight: 600,
  color: 'primary.main',
  transition: 'color 0.2s ease',
  fontSize: { xs: '11px', sm: '12px' },
  ...commentTextStyles,
};

const commentPreviewTextStyles = {
  fontSize: { xs: '11px', sm: '12px' },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  lineHeight: 1.4,
  wordBreak: 'break-word' as const,
  ...commentTextStyles,
  '& .comment-link': {
    color: 'primary.light',
    textDecoration: 'underline',
    '&:hover': {
      color: 'primary.main',
    },
  },
};

const commentPreviewMediaCountStyles = {
  fontSize: { xs: '11px', sm: '12px' },
  ...commentTextStyles,
};

const replyPreviewCancelButtonStyles = {
  color: 'grey.500',
  '&:hover': { color: 'common.white' },
};

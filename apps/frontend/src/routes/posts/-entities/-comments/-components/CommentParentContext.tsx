import { Box, Paper, Stack, Typography } from '@mui/material';
import Linkify from 'linkify-react';

import type { CommentWithReplies } from '../-types';
import { getCommentUserName } from '../-utils/commentItemUtils';
import { CommentMediaThumbnails } from './CommentMediaThumbnails';
import { useCommentContext } from './comments-context';
export type CommentItemProps = {
  comment: CommentWithReplies;
  parentComment?: CommentWithReplies | null;
};
export function CommentParentContext({ comment, parentComment }: CommentItemProps) {
  const { handleJumpToComment } = useCommentContext();
  const parentCommentId = comment.parent_comment_id;
  if (!parentCommentId) return null;
  const parentUserName = getCommentUserName(parentComment ?? null);
  const parentMedia = parentComment?.media;
  const hasMedia = parentMedia && parentMedia.length > 0;
  const parentText = parentComment?.text ?? '';
  return (
    <Paper
      onClick={() => {
        handleJumpToComment(parentCommentId);
      }}
      title="Click to jump to original comment"
      sx={parentCommentPaperStyles}
    >
      <Stack direction="row" spacing={1.5}>
        {hasMedia ? (
          <CommentMediaThumbnails media={parentMedia} maxThumbnails={2} size="small" />
        ) : null}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={parentCommentTitleStyles}>
              {parentUserName}
            </Typography>
            {hasMedia ? (
              <Typography
                variant="caption"
                color="grey.500"
                sx={commentPreviewMediaCountStyles}
              >
                • {parentMedia.length}{' '}
                {parentMedia.length === 1 ? 'media item' : 'media items'}
              </Typography>
            ) : null}
          </Stack>
          {parentText ? (
            <Typography
              variant="caption"
              color="grey.300"
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
                {parentText}
              </Linkify>
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const parentCommentPaperStyles = {
  p: 1.5,
  mb: 1,
  borderLeft: '3px solid',
  borderColor: 'primary.main',
  bgcolor: 'rgba(0, 277, 106, 0.2)',
  borderRadius: 1.5,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    bgcolor: 'rgba(0, 257, 106, 0.25)',
  },
};

const parentCommentTitleStyles = {
  fontWeight: 600,
  color: 'primary.main',
  transition: 'color 0.2s ease',
  '&:hover': { color: 'primary.light' },
  ...commentTextStyles,
};

const commentPreviewMediaCountStyles = {
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

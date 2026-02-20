import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Linkify from 'linkify-react';

import type { CommentMedia, CommentProps } from '@/types/db';

import { getCommentMediaFullUrl } from '../-utils/commentMediaUtils';
import { CommentMediaWithLoading } from './CommentMediaWithLoading';

interface CommentContentProps extends CommentProps {
  onMediaClick: (mediaUrl: string, mediaType: 'photo' | 'video') => void;
}

export function CommentContent({ comment, onMediaClick }: CommentContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const media = comment.media;
  const commentText = comment.text;
  const shouldTruncate = commentText.length > MAX_PREVIEW_LENGTH;
  const displayText =
    shouldTruncate && !isExpanded
      ? commentText.slice(0, MAX_PREVIEW_LENGTH) + '...'
      : commentText;

  return (
    <>
      {commentText ? (
        <Box>
          <Typography variant="body2" sx={commentContentTextStyles} component="div">
            <Linkify
              options={{
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'comment-link',
              }}
            >
              {displayText}
            </Linkify>
          </Typography>
          {shouldTruncate ? (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={commentContentReadMoreButtonStyles}
            >
              {isExpanded ? 'Hide ...' : 'Read more ...'}
            </Button>
          ) : null}
        </Box>
      ) : null}

      {media && media.length > 0 ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={{ xs: 0.5, sm: 0.75 }}
          sx={{ mt: { xs: 0.375, sm: 0.5 } }}
        >
          {media.map((mediaItem, index) => (
            <CommentMediaItem
              key={mediaItem.url || index}
              mediaItem={mediaItem}
              index={index}
              onMediaClick={onMediaClick}
            />
          ))}
        </Stack>
      ) : null}
    </>
  );
}

interface CommentMediaProps {
  mediaItem: CommentMedia;
  index: number;
  onMediaClick: (mediaUrl: string, mediaType: 'photo' | 'video') => void;
}

const MAX_PREVIEW_LENGTH = 200;

function CommentMediaItem({ mediaItem, index, onMediaClick }: CommentMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaUrl = getCommentMediaFullUrl(mediaItem);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (mediaItem.type === 'photo' && isLoaded) {
      onMediaClick(mediaUrl, mediaItem.type);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        ...commentContentMediaItemStyles,
        cursor: mediaItem.type === 'photo' && isLoaded ? 'pointer' : 'default',
      }}
    >
      <CommentMediaWithLoading
        type={mediaItem.type}
        src={mediaUrl}
        alt={`Comment media ${index + 1}`}
        onLoad={handleLoad}
        sx={commentContentMediaImageStyles}
        videoControls
        onVideoClick={(e) => e.stopPropagation()}
      />
      {mediaItem.type === 'photo' && isLoaded ? (
        <Box className="comment-media-overlay" sx={commentContentMediaOverlayStyles} />
      ) : null}
    </Box>
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const commentContentTextStyles = {
  color: 'grey.200',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  fontSize: { xs: '12px', sm: '13px' },
  lineHeight: { xs: 1.4, sm: 1.5 },
  ...commentTextStyles,
  '& .comment-link': {
    color: 'primary.light',
    textDecoration: 'underline',
    '&:hover': {
      color: 'primary.main',
    },
  },
};

const commentContentReadMoreButtonStyles = {
  mt: { xs: 0.25, sm: 0.5 },
  p: 0,
  minWidth: 'auto',
  textTransform: 'none',
  color: 'primary.light',
  fontSize: { xs: '11px', sm: '0.75rem' },
  '&:hover': {
    bgcolor: 'transparent',
    textDecoration: 'underline',
  },
};

const MEDIA_SIZE = {
  minWidth: { xs: 80, sm: 100 },
  minHeight: { xs: 80, sm: 100 },
  maxWidth: { xs: 150, sm: 200 },
  maxHeight: { xs: 150, sm: 200 },
};

const commentContentMediaItemStyles = {
  position: 'relative',
  borderRadius: 1,
  overflow: 'hidden',
  ...MEDIA_SIZE,
  '&:hover .comment-media-overlay': {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
};

const commentContentMediaImageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
  border: '2px solid',
  borderColor: 'grey.800',
  borderRadius: 1,
  transition: 'border-color 0.2s ease',
  '&:hover': {
    borderColor: 'primary.light',
  },
};

const commentContentMediaOverlayStyles = {
  position: 'absolute',
  inset: 0,
  borderRadius: 1,
  transition: 'background-color 0.2s ease',
  pointerEvents: 'none',
};

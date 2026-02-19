import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import type { CommentMedia } from '@/types/db';

import { getCommentMediaFullUrl } from '../-utils/commentMediaUtils';
import { CommentMediaWithLoading } from './CommentMediaWithLoading';

type ThumbnailSize = 'small' | 'medium';

interface MediaThumbnailsProps {
  media: CommentMedia[];
  maxThumbnails?: number;
  size?: ThumbnailSize;
}

const SIZES: Record<ThumbnailSize, { dimension: number; icon: number; spinner: number }> =
  {
    small: { dimension: 32, icon: 12, spinner: 12 },
    medium: { dimension: 40, icon: 14, spinner: 16 },
  };

function MediaThumbnailItem({
  mediaItem,
  size,
}: {
  mediaItem: CommentMedia;
  size: ThumbnailSize;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { dimension, icon, spinner } = SIZES[size];

  return (
    <Box sx={getThumbnailStyles(dimension)}>
      <CommentMediaWithLoading
        type={mediaItem.type}
        src={getCommentMediaFullUrl(mediaItem)}
        alt="Media thumbnail"
        onLoad={() => setIsLoaded(true)}
        sx={thumbnailMediaStyles}
        videoMuted
        spinnerSize={spinner}
        hideLoadingBorder
      />
      {mediaItem.type === 'video' && isLoaded ? (
        <Box sx={videoOverlayStyles}>
          <Box
            component="img"
            src="/links_logo/Vector.svg"
            alt=""
            aria-hidden="true"
            sx={{ width: icon, height: icon }}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export function CommentMediaThumbnails({
  media,
  maxThumbnails = 3,
  size = 'medium',
}: MediaThumbnailsProps) {
  const visible = media.slice(0, maxThumbnails);
  const overflow = media.length - maxThumbnails;
  const { dimension } = SIZES[size];

  return (
    <Stack direction="row" spacing={0.5} flexShrink={0}>
      {visible.map((item) => (
        <MediaThumbnailItem key={item.url} mediaItem={item} size={size} />
      ))}
      {overflow > 0 ? (
        <Box
          sx={{
            ...getThumbnailStyles(dimension),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'grey.400' }}>
            +{overflow}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

const getThumbnailStyles = (dim: number) => ({
  position: 'relative' as const,
  width: dim,
  height: dim,
  borderRadius: 1,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'grey.800',
  bgcolor: 'grey.900',
});

const thumbnailMediaStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
};

const videoOverlayStyles = {
  position: 'absolute' as const,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'rgba(0,0,0,0.3)',
  pointerEvents: 'none' as const,
};

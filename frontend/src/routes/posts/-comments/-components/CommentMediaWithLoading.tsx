import { useEffect, useState } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { Box, CircularProgress } from '@mui/material';

import type { TypeMedia } from '../-types/comments-db';

interface CommentMediaWithLoadingProps {
  type: TypeMedia;
  src: string;
  alt?: string;
  onLoad?: () => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  videoControls?: boolean;
  videoMuted?: boolean;
  onVideoClick?: (e: React.MouseEvent) => void;
  spinnerSize?: number;
  hideLoadingBorder?: boolean;
}

export function CommentMediaWithLoading({
  type,
  src,
  alt,
  onLoad,
  onClick,
  sx,
  videoControls,
  videoMuted,
  onVideoClick,
  spinnerSize = 24,
  hideLoadingBorder,
}: CommentMediaWithLoadingProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(() =>
    getInitialStatus(src),
  );

  useEffect(() => {
    setStatus((prev) => (prev === 'loaded' ? 'loaded' : getInitialStatus(src)));
  }, [src]);

  if (!src) {
    return <Box sx={errorStyles}>No source</Box>;
  }

  const handleLoad = () => {
    setStatus('loaded');
    onLoad?.();
  };

  const handleError = () => setStatus('error');

  const isLoading = status === 'loading';
  const hasError = status === 'error';

  const mediaSx: SxProps<Theme> = {
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.2s ease',
    display: hasError ? 'none' : 'block',
    ...(sx as object),
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {type === 'photo' ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          loading="eager"
          decoding="async"
          sx={mediaSx}
        />
      ) : (
        <Box
          component="video"
          src={src}
          onLoadedData={handleLoad}
          onError={handleError}
          onClick={onVideoClick}
          controls={videoControls}
          muted={videoMuted}
          preload="metadata"
          sx={mediaSx}
        />
      )}

      {isLoading && !hasError ? (
        <Box sx={getLoadingStyles(hideLoadingBorder)}>
          <CircularProgress size={spinnerSize} sx={{ color: 'grey.600' }} />
        </Box>
      ) : null}

      {hasError ? <Box sx={errorStyles}>Failed to load</Box> : null}
    </Box>
  );
}

function getInitialStatus(src: string): 'loading' | 'loaded' {
  return src.startsWith('blob:') ? 'loaded' : 'loading';
}

const overlayBase = {
  position: 'absolute' as const,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 1,
  zIndex: 1,
} as const;

const errorStyles = {
  ...overlayBase,
  bgcolor: 'grey.800',
  color: 'grey.400',
  fontSize: '11px',
  textAlign: 'center' as const,
  padding: 1,
  border: '1px solid',
  borderColor: 'grey.800',
};

const getLoadingStyles = (hideBorder?: boolean) => ({
  ...overlayBase,
  bgcolor: 'grey.900',
  ...(hideBorder ? {} : { border: '1px solid', borderColor: 'grey.800' }),
});

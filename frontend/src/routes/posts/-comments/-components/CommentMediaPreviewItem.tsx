import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton } from '@mui/material';

import { ImageModal } from '../../-components/ImageModal';
import type { MediaItem } from '../-utils/commentMediaUtils';
import { getCommentMediaFullUrl } from '../-utils/commentMediaUtils';
import { CommentMediaWithLoading } from './CommentMediaWithLoading';

interface MediaPreviewItemProps {
  item: MediaItem;
  onRemove: () => void;
}

export function CommentMediaPreviewItem({ item, onRemove }: MediaPreviewItemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = item.isExisting
    ? getCommentMediaFullUrl({ url: item.url })
    : item.url;

  if (!displayUrl) return null;

  const isPhoto = item.type === 'photo';

  const openPreview = () => {
    if (isPhoto) setPreviewUrl(displayUrl);
  };

  return (
    <>
      <Box onClick={openPreview} sx={containerStyles}>
        <CommentMediaWithLoading
          type={item.type}
          src={displayUrl}
          alt={`Preview ${item.index + 1}`}
          sx={mediaStyles}
          videoMuted
          spinnerSize={20}
        />

        {isPhoto ? <Box sx={hoverOverlayStyles} /> : null}

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={closeButtonStyles}
          aria-label="Remove media"
        >
          <CloseIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
        </IconButton>
      </Box>

      {previewUrl ? (
        <ImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      ) : null}
    </>
  );
}

const containerStyles = {
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    '& .hover-overlay': { opacity: 1 },
  },
};

const mediaStyles = {
  width: { xs: 56, sm: 64, md: 72 },
  height: { xs: 56, sm: 64, md: 72 },
  objectFit: 'cover',
  borderRadius: { xs: 0.75, sm: 1 },
  border: '2px solid',
  borderColor: 'grey.800',
  transition: 'border-color 0.2s ease',
  '&:hover': { borderColor: 'primary.main' },
};

const hoverOverlayStyles = {
  className: 'hover-overlay',
  position: 'absolute',
  inset: 0,
  bgcolor: 'rgba(0, 0, 0, 0.4)',
  borderRadius: { xs: 0.75, sm: 1 },
  opacity: 0,
  transition: 'opacity 0.2s ease',
  pointerEvents: 'none',
  zIndex: 1,
};

const closeButtonStyles = {
  position: 'absolute',
  top: 0,
  right: 0,
  p: 0,
  color: 'grey.400',
  zIndex: 2,
  transition: 'color 0.2s ease',
  '&:hover': { color: 'common.white', bgcolor: 'transparent' },
};

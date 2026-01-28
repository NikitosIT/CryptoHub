import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

import {
  commentMediaContainerStyles,
  commentMediaErrorOverlayStyles,
  getCommentMediaLoadingOverlayStyles,
} from "../-utils/commentStyles";

interface MediaWithLoadingProps {
  type: "photo" | "video";
  src: string;
  alt?: string;
  onLoad?: () => void;
  onClick?: () => void;
  sx?: object;
  videoProps?: {
    controls?: boolean;
    muted?: boolean;
    onLoadedData?: () => void;
    onClick?: (e: React.MouseEvent) => void;
  };
  loadingSpinnerSize?: number;
  loadingOverlaySx?: object;
}

export function CommentMediaWithLoading({
  type,
  src,
  alt,
  onLoad,
  onClick,
  sx,
  videoProps = {},
  loadingSpinnerSize = 24,
  loadingOverlaySx,
}: MediaWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoading(src ? !src.startsWith("blob:") : false);
  }, [src]);

  if (!src) {
    return <Box sx={commentMediaErrorOverlayStyles}>No source</Box>;
  }

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const mediaElementSx = {
    opacity: isLoading ? 0 : 1,
    transition: "opacity 0.2s ease",
    display: hasError ? "none" : "block",
    ...sx,
  };

  return (
    <Box sx={commentMediaContainerStyles}>
      {type === "photo" ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          loading="eager"
          decoding="async"
          sx={mediaElementSx}
        />
      ) : (
        <Box
          component="video"
          src={src}
          onLoadedData={handleLoad}
          onError={handleError}
          onClick={videoProps.onClick}
          sx={mediaElementSx}
          controls={videoProps.controls}
          muted={videoProps.muted}
          preload="metadata"
        />
      )}

      {isLoading && !hasError ? (
        <Box sx={getCommentMediaLoadingOverlayStyles(loadingOverlaySx)}>
          <CircularProgress size={loadingSpinnerSize} sx={{ color: "grey.600" }} />
        </Box>
      ) : null}

      {hasError ? (
        <Box sx={commentMediaErrorOverlayStyles}>Failed to load</Box>
      ) : null}
    </Box>
  );
}

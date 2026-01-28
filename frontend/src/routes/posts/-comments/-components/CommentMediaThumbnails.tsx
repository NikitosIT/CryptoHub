import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";

import type { CommentMedia } from "@/types/db";

import { getCommentMediaFullUrl } from "../-utils/commentMediaUtils";
import {
  getMediaThumbnailContainerStyles,
  getMediaThumbnailCountBadgeStyles,
  getMediaThumbnailVideoOverlayStyles,
  mediaThumbnailCountTextStyles,
  mediaThumbnailIconSizes,
  mediaThumbnailMediaStyles,
  mediaThumbnailSizes,
  mediaThumbnailSpinnerSizes,
} from "../-utils/commentStyles";
import { CommentMediaWithLoading } from "./CommentMediaWithLoading";

type ThumbnailSize = "small" | "medium";

interface MediaThumbnailsProps {
  media: CommentMedia[];
  maxThumbnails?: number;
  size?: ThumbnailSize;
}

function MediaThumbnailItem({ mediaItem, size }: { mediaItem: CommentMedia; size: ThumbnailSize }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaUrl = getCommentMediaFullUrl(mediaItem);

  return (
    <Box sx={getMediaThumbnailContainerStyles(mediaThumbnailSizes[size])}>
      <CommentMediaWithLoading
        type={mediaItem.type}
        src={mediaUrl}
        alt="Media thumbnail"
        onLoad={() => setIsLoaded(true)}
        sx={mediaThumbnailMediaStyles}
        videoProps={{ muted: true }}
        loadingSpinnerSize={mediaThumbnailSpinnerSizes[size]}
        loadingOverlaySx={{ border: "none" }}
      />
      {mediaItem.type === "video" && isLoaded ? (
        <Box sx={getMediaThumbnailVideoOverlayStyles(mediaThumbnailIconSizes[size])}>
          <Box component="img" src="/links_logo/Vector.svg" alt="" aria-hidden="true" />
        </Box>
      ) : null}
    </Box>
  );
}

export function CommentMediaThumbnails({ media, maxThumbnails = 3, size = "medium" }: MediaThumbnailsProps) {
  const thumbnailsToShow = media.slice(0, maxThumbnails);
  const remainingCount = media.length - maxThumbnails;

  return (
    <Stack direction="row" spacing={0.5} flexShrink={0}>
      {thumbnailsToShow.map((item) => (
        <MediaThumbnailItem key={item.url} mediaItem={item} size={size} />
      ))}
      {remainingCount > 0 ? (
        <Box sx={getMediaThumbnailCountBadgeStyles(mediaThumbnailSizes[size])}>
          <Typography variant="caption" sx={mediaThumbnailCountTextStyles}>
            +{remainingCount}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

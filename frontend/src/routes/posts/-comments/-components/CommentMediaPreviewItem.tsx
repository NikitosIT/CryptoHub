import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton } from "@mui/material";

import { ImageModal } from "../../-components/ImageModal";
import { getCommentMediaFullUrl } from "../-utils/commentMediaUtils";
import {
  commentMediaPreviewItemCloseButtonStyles,
  commentMediaPreviewItemCloseIconStyles,
  commentMediaPreviewItemContainerStyles,
  commentMediaPreviewItemMediaStyles,
  commentMediaPreviewItemOverlayStyles,
} from "../-utils/commentStyles";
import { CommentMediaWithLoading } from "./CommentMediaWithLoading";

interface MediaPreviewItemProps {
  item: {
    type: "photo" | "video";
    url: string;
    index: number;
    isExisting: boolean;
  };
  onRemove: () => void;
}

export function CommentMediaPreviewItem({
  item,
  onRemove,
}: MediaPreviewItemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = item.isExisting
    ? getCommentMediaFullUrl({ url: item.url })
    : item.url;

  if (!displayUrl) return null;

  const isPhoto = item.type === "photo";

  const openPreview = () => {
    if (isPhoto) setPreviewUrl(displayUrl);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <>
      <Box sx={commentMediaPreviewItemContainerStyles}>
        <CommentMediaWithLoading
          type={item.type}
          src={displayUrl}
          alt={`Preview ${item.index + 1}`}
          onClick={isPhoto ? openPreview : undefined}
          sx={commentMediaPreviewItemMediaStyles}
          videoProps={{ muted: true, controls: false }}
          loadingSpinnerSize={20}
        />
        {isPhoto ? (
          <Box
            className="comment-media-preview-overlay"
            sx={commentMediaPreviewItemOverlayStyles}
            onClick={(e) => {
              e.stopPropagation();
              openPreview();
            }}
          />
        ) : null}
        <IconButton
          size="small"
          onClick={handleRemove}
          sx={commentMediaPreviewItemCloseButtonStyles}
          className="comment-media-preview-close-button"
          aria-label="Remove media"
        >
          <CloseIcon sx={commentMediaPreviewItemCloseIconStyles} />
        </IconButton>
      </Box>
      {previewUrl ? (
        <ImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      ) : null}
    </>
  );
}

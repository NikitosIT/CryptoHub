import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Linkify from "linkify-react";

import type { CommentMedia } from "@/types/db";

import { getCommentMediaFullUrl } from "../-utils/commentMediaUtils";
import {
  commentContentMediaImageStyles,
  commentContentMediaItemStyles,
  commentContentMediaOverlayStyles,
  commentContentReadMoreButtonStyles,
  commentContentTextStyles,
} from "../-utils/commentStyles";
import { CommentMediaWithLoading } from "./CommentMediaWithLoading";

interface CommentContentProps {
  text: string | null;
  media: CommentMedia[] | null;
  onMediaClick: (mediaUrl: string, mediaType: "photo" | "video") => void;
}

export function CommentContent({
  text,
  media,
  onMediaClick,
}: CommentContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const commentText = (text || "").trim();
  const shouldTruncate = commentText.length > MAX_PREVIEW_LENGTH;
  const displayText =
    shouldTruncate && !isExpanded
      ? commentText.slice(0, MAX_PREVIEW_LENGTH) + "..."
      : commentText;

  return (
    <>
      {commentText ? (
        <Box>
          <Typography
            variant="body2"
            sx={commentContentTextStyles}
            component="div"
          >
            <Linkify
              options={{
                target: "_blank",
                rel: "noopener noreferrer",
                className: "comment-link",
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
              {isExpanded ? "Hide ..." : "Read more ..."}
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
  onMediaClick: (mediaUrl: string, mediaType: "photo" | "video") => void;
}

const MAX_PREVIEW_LENGTH = 200;

function CommentMediaItem({
  mediaItem,
  index,
  onMediaClick,
}: CommentMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaUrl = getCommentMediaFullUrl(mediaItem);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (mediaItem.type === "photo" && isLoaded) {
      onMediaClick(mediaUrl, mediaItem.type);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        ...commentContentMediaItemStyles,
        cursor: mediaItem.type === "photo" && isLoaded ? "pointer" : "default",
      }}
    >
      <CommentMediaWithLoading
        type={mediaItem.type}
        src={mediaUrl}
        alt={`Comment media ${index + 1}`}
        onLoad={handleLoad}
        sx={commentContentMediaImageStyles}
        videoProps={{
          controls: true,
          onClick: (e) => e.stopPropagation(),
        }}
        loadingOverlaySx={{
          border: "2px solid",
          minWidth: 100,
          minHeight: 100,
        }}
      />
      {mediaItem.type === "photo" && isLoaded ? (
        <Box
          className="comment-media-overlay"
          sx={commentContentMediaOverlayStyles}
        />
      ) : null}
    </Box>
  );
}

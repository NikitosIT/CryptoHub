import { Box, Paper, Stack, Typography } from "@mui/material";
import Linkify from "linkify-react";

import {
  commentPreviewMediaCountStyles,
  commentPreviewTextStyles,
  parentCommentPaperStyles,
  parentCommentTitleStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import type { CommentMedia } from "@/types/db";

import { CommentMediaThumbnails } from "./CommentMediaThumbnails";
interface CommentParentContextProps {
  parentCommentId: number;
  parentUserName: string;
  parentText: string;
  parentMedia?: CommentMedia[] | null;
  handleJumpToComment: (commentId: number) => void;
}

export function CommentParentContext({
  parentCommentId,
  parentUserName,
  parentText,
  parentMedia,
  handleJumpToComment,
}: CommentParentContextProps) {
  const hasMedia = parentMedia && parentMedia.length > 0;

  return (
    <Paper
      onClick={() => handleJumpToComment(parentCommentId)}
      title="Click to jump to original comment"
      sx={parentCommentPaperStyles}
    >
      <Stack direction="row" spacing={1.5}>
        {hasMedia ? (
          <CommentMediaThumbnails
            media={parentMedia}
            maxThumbnails={2}
            size="small"
          />
        ) : null}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="caption" sx={parentCommentTitleStyles}>
              {parentUserName}
            </Typography>
            {hasMedia ? (
              <Typography
                variant="caption"
                color="grey.500"
                sx={commentPreviewMediaCountStyles}
              >
                • {parentMedia.length}{" "}
                {parentMedia.length === 1 ? "media item" : "media items"}
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
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "comment-link",
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

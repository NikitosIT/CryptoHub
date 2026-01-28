import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import Linkify from "linkify-react";

import { getCommentUserName } from "@/routes/posts/-comments/-utils/commentItemUtils";
import {
  commentPreviewClickableBoxStyles,
  commentPreviewMediaCountStyles,
  commentPreviewTextStyles,
  commentPreviewTitleStyles,
  replyPreviewCancelButtonStyles,
  replyPreviewPaperStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import type { CommentWithReplies } from "@/types/db";

import { CommentMediaThumbnails } from "./CommentMediaThumbnails";
interface ReplyPreviewProps {
  replyingTo: CommentWithReplies;
  onCancel: () => void;
  handleJumpToComment: (commentId: number) => void;
}

export function CommentReplyPreview({
  replyingTo,
  onCancel,
  handleJumpToComment,
}: ReplyPreviewProps) {
  const replyingToUserName = getCommentUserName(replyingTo);
  const replyingToText = replyingTo.text || "";
  const media = replyingTo.media;
  const hasMedia = media && media.length > 0;

  return (
    <Paper elevation={0} sx={replyPreviewPaperStyles}>
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={{ xs: 1, sm: 1.5 }}
      >
        <Box
          onClick={() => handleJumpToComment(replyingTo.id)}
          sx={commentPreviewClickableBoxStyles}
          title="Click to jump to original comment"
        >
          {hasMedia ? (
            <CommentMediaThumbnails
              media={media}
              maxThumbnails={3}
              size="medium"
            />
          ) : null}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="caption"
                className="reply-preview-title"
                sx={commentPreviewTitleStyles}
              >
                Reply to {replyingToUserName}
              </Typography>
              {hasMedia ? (
                <Typography
                  variant="caption"
                  color="grey.500"
                  sx={commentPreviewMediaCountStyles}
                >
                  • {media.length}{" "}
                  {media.length === 1 ? "media item" : "media items"}
                </Typography>
              ) : null}
            </Stack>
            {replyingToText ? (
              <Typography
                variant="caption"
                color="grey.200"
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
                  {replyingToText}
                </Linkify>
              </Typography>
            ) : null}
          </Box>
        </Box>

        <IconButton
          onClick={onCancel}
          aria-label="Cancel reply"
          size="small"
          sx={replyPreviewCancelButtonStyles}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

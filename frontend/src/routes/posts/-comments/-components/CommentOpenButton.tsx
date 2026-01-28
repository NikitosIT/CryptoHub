import { Badge, Box, IconButton } from "@mui/material";

import { useCommentsModalPersistence } from "@/routes/posts/-comments/-hooks/useCommentsModalPersistence";
import type { TelegramPost } from "@/types/db";

import {
  commentOpenButtonIconStyles,
  commentOpenButtonStyles,
} from "../-utils/commentStyles";
import { CommentModal } from "./CommentModal";

interface CommentButtonProps {
  post: TelegramPost;
}

export function CommentOpenButton({ post }: CommentButtonProps) {
  const { isOpen, open, close } = useCommentsModalPersistence(post.id);
  const commentsCount = post.comments_count ?? 0;

  return (
    <>
      <IconButton
        onClick={open}
        aria-label={
          commentsCount > 0
            ? `Open comments (${commentsCount})`
            : "Open comments"
        }
        sx={commentOpenButtonStyles}
      >
        <Badge
          badgeContent={commentsCount}
          color="primary"
          overlap="circular"
          invisible={commentsCount === 0}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box
            component="img"
            src="/links_logo/comments.svg"
            alt="Comments"
            sx={commentOpenButtonIconStyles}
          />
        </Badge>
      </IconButton>

      <CommentModal postId={post.id} isOpen={isOpen} onClose={close} />
    </>
  );
}

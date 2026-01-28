import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Paper, Stack, Typography } from "@mui/material";

import { getCommentUserName } from "@/routes/posts/-comments/-utils/commentItemUtils";
import {
  editPreviewCancelButtonStyles,
  editPreviewPaperStyles,
  editPreviewSubtitleStyles,
  editPreviewTitleStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import type { CommentWithReplies } from "@/types/db";
interface EditPreviewProps {
  editingComment: CommentWithReplies | null;
  onCancel: () => void;
}

export function CommentEditPreview({
  editingComment,
  onCancel,
}: EditPreviewProps) {
  if (!editingComment) return null;

  const editingCommentUserName = getCommentUserName(editingComment);

  return (
    <Paper elevation={0} sx={editPreviewPaperStyles}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack
          direction="row"
          spacing={{ xs: 0.75, sm: 1 }}
          alignItems="center"
        >
          <Typography variant="caption" sx={editPreviewTitleStyles}>
            Editing comment
          </Typography>
          <Typography
            variant="caption"
            color="grey.400"
            sx={editPreviewSubtitleStyles}
          >
            by {editingCommentUserName}
          </Typography>
        </Stack>
        <IconButton
          onClick={onCancel}
          size="small"
          sx={editPreviewCancelButtonStyles}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

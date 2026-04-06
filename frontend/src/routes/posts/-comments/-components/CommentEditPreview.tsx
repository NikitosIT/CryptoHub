import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

import { getCommentUserName } from '@/routes/posts/-comments/-utils/commentItemUtils';

import { useCommentContext } from './comments-context';

export function CommentEditPreview() {
  const { editingComment, cancelEdit } = useCommentContext();
  if (!editingComment) return null;

  const editingCommentUserName = getCommentUserName(editingComment);

  return (
    <Paper elevation={0} sx={editPreviewPaperStyles}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
          <Typography variant="caption" sx={editPreviewTitleStyles}>
            Editing comment
          </Typography>
          <Typography variant="caption" color="grey.400" sx={editPreviewSubtitleStyles}>
            by {editingCommentUserName}
          </Typography>
        </Stack>
        <IconButton onClick={cancelEdit} size="small" sx={editPreviewCancelButtonStyles}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const editPreviewPaperStyles = (theme: Theme) => ({
  p: { xs: 1, sm: 1.5 },
  mb: { xs: 1.5, sm: 2 },
  borderLeft: { xs: '3px solid', sm: '4px solid' },
  borderColor: 'primary.main',
  bgcolor: alpha(theme.palette.primary.main, 0.12),
  borderRadius: { xs: 1, sm: 1.5 },
});

const editPreviewTitleStyles = {
  fontWeight: 600,
  color: 'primary.light',
  fontSize: { xs: '11px', sm: '12px' },
  ...commentTextStyles,
};

const editPreviewSubtitleStyles = {
  fontSize: { xs: '11px', sm: '12px' },
  ...commentTextStyles,
};

const editPreviewCancelButtonStyles = {
  color: 'grey.400',
  '&:hover': { color: 'common.white' },
};

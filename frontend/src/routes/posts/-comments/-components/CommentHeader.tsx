import { Stack, Typography } from '@mui/material';

import type { CommentProps } from '@/types/db';
import { formatRelativeTime } from '@/utils/formatDate';

import { useCommentItem } from '../-hooks/useCommentItem';
import { getCommentUserName } from '../-utils/commentItemUtils';

export function CommentHeader({ comment }: CommentProps) {
  const { isOwner } = useCommentItem({ comment });
  const userName = getCommentUserName(comment);
  const createdAt = comment.created_at;
  const updatedAt = comment.updated_at;
  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.375, sm: 0.5 }}
      alignItems="center"
      sx={{ mb: { xs: 0.125, sm: 0.125 } }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: isOwner ? 'primary.light' : 'primary.main',
          fontSize: { xs: '12px', sm: '13px' },
          ...commentTextStyles,
        }}
      >
        {userName}
      </Typography>
      <Typography
        variant="caption"
        color="grey.500"
        sx={{
          fontSize: { xs: '10px', sm: '11px' },
          ...commentTextStyles,
        }}
      >
        {formatRelativeTime(createdAt)}
        {isEdited(createdAt, updatedAt) && ' (edited)'}
      </Typography>
    </Stack>
  );
}

const EDITED_THRESHOLD_MS = 1000;

function isEdited(createdAt: string, updatedAt: string): boolean {
  if (createdAt === updatedAt) return false;
  return (
    Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) >
    EDITED_THRESHOLD_MS
  );
}

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

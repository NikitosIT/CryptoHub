import { Avatar } from '@mui/material';

import type { CommentProps } from '../-types';
import { getCommentAvatarUrl, getCommentUserName } from '../-utils/commentItemUtils';

export function CommentAvatar({ comment }: CommentProps) {
  const avatarUrl = getCommentAvatarUrl(comment);
  const nickname = getCommentUserName(comment);
  return (
    <Avatar
      src={avatarUrl ?? undefined}
      alt="avatar"
      sx={commentAvatarStyles}
      slotProps={{
        img: {
          onError: (event) => {
            (event.currentTarget as HTMLImageElement).src = '';
          },
        },
      }}
    >
      {nickname}
    </Avatar>
  );
}

const commentAvatarStyles = {
  width: { xs: 24, sm: 28 },
  height: { xs: 24, sm: 28 },
  border: '1px solid',
  borderColor: 'grey.700',
  bgcolor: 'grey.800',
  fontSize: { xs: '0.6rem', sm: '0.7rem' },
  fontWeight: 600,
  color: 'grey.300',
  flexShrink: 0,
};

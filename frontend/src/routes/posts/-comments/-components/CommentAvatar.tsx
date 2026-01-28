import { Avatar } from "@mui/material";

import { commentAvatarStyles } from "../-utils/commentStyles";

interface CommentAvatarProps {
  avatarUrl: string | null;
  userName: string;
}

export function CommentAvatar({ avatarUrl, userName }: CommentAvatarProps) {
  const trimmed = userName.trim();
  const initial = (trimmed[0] || "?").toUpperCase();

  return (
    <Avatar
      src={avatarUrl ?? undefined}
      alt={userName}
      sx={commentAvatarStyles}
      imgProps={{
        onError: (event) => {
          (event.currentTarget as HTMLImageElement).src = "";
        },
      }}
    >
      {initial}
    </Avatar>
  );
}

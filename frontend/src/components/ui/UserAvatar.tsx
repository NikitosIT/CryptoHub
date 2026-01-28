import { Avatar, Skeleton } from "@mui/material";

import { useAvatarUrl } from "@/hooks/useAvatarUrl";

interface UserAvatarProps {
  size?: number;
  showSkeleton?: boolean;
  borderColor?: string;
}

export function UserAvatar({
  size = 40,
  showSkeleton = true,
  borderColor = "#fbbf24",
}: UserAvatarProps) {
  const { avatarUrl, isLoading } = useAvatarUrl();

  if (showSkeleton && isLoading) {
    return (
      <Skeleton
        variant="circular"
        width={size}
        height={size}
        sx={{
          border: `2px solid ${borderColor}`,
          bgcolor: "rgba(251, 191, 36, 0.1)",
        }}
      />
    );
  }

  return (
    <Avatar
      src={avatarUrl || undefined}
      alt="Avatar"
      sx={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
      }}
    >
      Avatar
    </Avatar>
  );
}

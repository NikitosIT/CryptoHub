import { Stack, Typography } from "@mui/material";

import { commentTextStyles } from "@/routes/posts/-comments/-utils/commentStyles";
import { formatRelativeTime } from "@/utils/formatDate";

interface CommentHeaderProps {
  userName: string;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export function CommentHeader({
  userName,
  isOwner,
  createdAt,
  updatedAt,
}: CommentHeaderProps) {
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
          color: isOwner ? "primary.light" : "primary.main",
          fontSize: { xs: "12px", sm: "13px" },
          ...commentTextStyles,
        }}
      >
        {userName}
      </Typography>
      <Typography
        variant="caption"
        color="grey.500"
        sx={{
          fontSize: { xs: "10px", sm: "11px" },
          ...commentTextStyles,
        }}
      >
        {formatRelativeTime(createdAt)}
        {updatedAt !== createdAt && " (edited)"}
      </Typography>
    </Stack>
  );
}

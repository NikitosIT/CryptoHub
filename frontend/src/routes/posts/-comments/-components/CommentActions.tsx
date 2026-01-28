import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { Button, Stack } from "@mui/material";

import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import {
  commentActionsLikeButtonStyles,
  commentActionsReplyButtonStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";

import {
  CommentActionsMenu,
  type SharedCommentActionProps,
} from "./CommentActionsMenu";

interface CommentActionsProps extends SharedCommentActionProps {
  onToggleLike: () => void;
  likeCount: number;
  userHasLiked: boolean;
}

export function CommentActions({
  isOwner,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onToggleLike,
  likeCount,
  userHasLiked,
}: CommentActionsProps) {
  const { user } = useAuthState();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{ xs: 0.5, sm: 0.75 }}
      sx={{ mt: { xs: 0.375, sm: 0.5 } }}
    >
      <Button
        onClick={onToggleLike}
        disabled={!user?.id}
        size="small"
        variant="text"
        startIcon={
          userHasLiked ? (
            <FavoriteIcon sx={{ fontSize: { xs: "16px", sm: "18px" } }} />
          ) : (
            <FavoriteBorderOutlinedIcon
              sx={{ fontSize: { xs: "16px", sm: "18px" } }}
            />
          )
        }
        sx={{
          ...commentActionsLikeButtonStyles,
          color: userHasLiked ? "error.light" : "grey.400",
          "&:hover": {
            color: userHasLiked ? "error.main" : "grey.200",
            backgroundColor: "transparent",
          },
          "&.Mui-disabled": {
            color: "grey.600",
          },
        }}
      >
        {likeCount}
      </Button>

      {user?.id ? (
        <Button
          onClick={onReply}
          variant="text"
          size="small"
          sx={commentActionsReplyButtonStyles}
        >
          Reply
        </Button>
      ) : null}
      <CommentActionsMenu
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
        onReply={user?.id ? onReply : undefined}
      />
    </Stack>
  );
}

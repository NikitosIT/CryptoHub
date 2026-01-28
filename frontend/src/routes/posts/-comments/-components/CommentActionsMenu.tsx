import { useState } from "react";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import {
  commentActionsMenuDeleteItemStyles,
  commentActionsMenuDividerStyles,
  commentActionsMenuIconButtonStyles,
  commentActionsMenuPaperStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";

export interface SharedCommentActionProps {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onReply?: () => void;
}

type CommentActionsMenuProps = SharedCommentActionProps;

export function CommentActionsMenu({
  isOwner,
  onEdit,
  onDelete,
  onCopy,
  onReply,
}: CommentActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Comment actions"
        size="small"
        sx={commentActionsMenuIconButtonStyles}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: commentActionsMenuPaperStyles,
        }}
      >
        {onReply ? (
          <MenuItem onClick={() => handleAction(onReply)}>
            <ListItemIcon>
              <ReplyOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Reply" />
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => handleAction(onCopy)}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy" />
        </MenuItem>
        {isOwner
          ? [
              <Divider
                key="owner-divider"
                sx={commentActionsMenuDividerStyles}
              />,
              <MenuItem key="owner-edit" onClick={() => handleAction(onEdit)}>
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>,
              <MenuItem
                key="owner-delete"
                data-delete="true"
                onClick={() => handleAction(onDelete)}
                sx={commentActionsMenuDeleteItemStyles}
              >
                <ListItemIcon>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </MenuItem>,
            ]
          : null}
      </Menu>
    </>
  );
}

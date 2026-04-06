import { useState } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';

import { useCommentItem } from '../-hooks/useCommentItem';
import type { CommentProps } from '../-types/comments-db';
import { useCommentContext } from './comments-context';

export function CommentActionsMenu({ comment }: CommentProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const { isOwner } = useCommentItem({ comment });
  const { handleReplyClick, handleEditClick, handleDeleteClick } = useCommentContext();
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(comment.text || '');
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: commentActionsMenuPaperStyles,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleReplyClick(comment);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ReplyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Reply" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopy();
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ContentCopyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy" />
        </MenuItem>
        {isOwner
          ? [
              <Divider key="owner-divider" sx={commentActionsMenuDividerStyles} />,
              <MenuItem
                key="owner-edit"
                onClick={() => {
                  handleEditClick(comment);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>,
              <MenuItem
                key="owner-delete"
                data-delete="true"
                onClick={() => {
                  handleDeleteClick(comment.id);
                  setAnchorEl(null);
                }}
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

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentCaptionStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
  fontSize: '0.875rem',
};

const commentActionsMenuPaperStyles = {
  bgcolor: 'grey.900',
  border: '1px solid',
  borderColor: 'grey.800',
  borderRadius: 2.5,
  minWidth: 180,
  mt: 0.5,
  overflow: 'hidden',
  '& .MuiMenuItem-root': {
    ...commentCaptionStyles,
    py: 1.5,
    px: 2,
    color: 'common.white',
    '&:hover': {
      bgcolor: 'grey.800',
    },
    '& .MuiListItemIcon-root': {
      minWidth: 40,
      color: 'common.white',
    },
    '& .MuiListItemText-primary': {
      ...commentCaptionStyles,
      fontWeight: 400,
      color: 'common.white',
    },
  },
};

const commentActionsMenuDeleteItemStyles = {
  color: '#ef4444 !important',
  '&:hover': {
    bgcolor: 'rgba(239, 68, 68, 0.1) !important',
    color: '#ef4444 !important',
  },
  '& .MuiListItemIcon-root': {
    color: '#ef4444 !important',
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    ...commentCaptionStyles,
    color: '#ef4444 !important',
    fontWeight: 500,
  },
};

const commentActionsMenuDividerStyles = {
  borderColor: 'grey.800',
  my: 0.5,
};

const commentActionsMenuIconButtonStyles = {
  color: 'grey.400',
  '&:hover': { color: 'common.white' },
};

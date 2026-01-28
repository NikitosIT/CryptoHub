import { alpha, type Theme } from "@mui/material/styles";

export const COMMENT_FONT_FAMILY = "Inter, sans-serif";

export const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

export const commentCaptionStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
  fontSize: "0.875rem",
};

export const commentInputTextFieldStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "grey.800",
    color: "common.white",
    ...commentTextStyles,
    fontSize: { xs: "16px", sm: "14px" },
    paddingRight: { xs: "48px", sm: "52px" },
    borderRadius: { xs: "20px", sm: "8px" },
    "& fieldset": {
      borderColor: "grey.600",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "grey.500",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
      borderWidth: "1px",
    },
    "& .MuiOutlinedInput-input": {
      color: "common.white",
      fontSize: { xs: "16px", sm: "14px" },
      ...commentTextStyles,
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      "@media (max-width: 640px)": {
        transform: "scale(1) !important",
        WebkitTextSizeAdjust: "100%",
      },
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: "grey.400",
      opacity: 1,
      fontSize: { xs: "16px", sm: "14px" },
      ...commentTextStyles,
    },
  },
};

export const commentActionsMenuPaperStyles = {
  bgcolor: "grey.900",
  border: "1px solid",
  borderColor: "grey.800",
  borderRadius: 1.5,
  minWidth: 180,
  mt: 0.5,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
  overflow: "hidden",
  "& .MuiMenuItem-root": {
    ...commentCaptionStyles,
    py: 1.5,
    px: 2,
    color: "common.white",
    "&:hover": {
      bgcolor: "grey.800",
    },
    "& .MuiListItemIcon-root": {
      minWidth: 40,
      color: "common.white",
    },
    "& .MuiListItemText-primary": {
      ...commentCaptionStyles,
      fontWeight: 400,
      color: "common.white",
    },
    "&[data-delete='true']": {
      color: "#ef4444 !important",
      "&:hover": {
        bgcolor: "rgba(239, 68, 68, 0.1) !important",
        color: "#ef4444 !important",
      },
      "& .MuiListItemIcon-root": {
        color: "#ef4444 !important",
      },
      "& .MuiListItemText-primary": {
        color: "#ef4444 !important",
        fontWeight: 500,
      },
    },
  },
};

export const commentActionsMenuDeleteItemStyles = {
  color: "#ef4444 !important",
  "&:hover": {
    bgcolor: "rgba(239, 68, 68, 0.1) !important",
    color: "#ef4444 !important",
  },
  "& .MuiListItemIcon-root": {
    color: "#ef4444 !important",
    minWidth: 40,
  },
  "& .MuiListItemText-primary": {
    ...commentCaptionStyles,
    color: "#ef4444 !important",
    fontWeight: 500,
  },
};

export const commentActionsMenuDividerStyles = {
  borderColor: "grey.800",
  my: 0.5,
};

export const commentActionsLikeButtonStyles = {
  textTransform: "none",
  fontSize: { xs: "11px", sm: "12px" },
  padding: { xs: "2px 6px", sm: "4px 6px" },
  minWidth: "auto",
  fontWeight: 500,
  ...commentTextStyles,
};

export const commentActionsReplyButtonStyles = {
  textTransform: "none",
  color: "grey.400",
  fontSize: { xs: "11px", sm: "12px" },
  padding: { xs: "2px 6px", sm: "4px 6px" },
  ...commentTextStyles,
  "&:hover": {
    color: "primary.light",
    backgroundColor: "transparent",
  },
};

export const commentAvatarStyles = {
  width: { xs: 24, sm: 28 },
  height: { xs: 24, sm: 28 },
  border: "1px solid",
  borderColor: "grey.700",
  bgcolor: "grey.800",
  fontSize: { xs: "0.6rem", sm: "0.7rem" },
  fontWeight: 600,
  color: "grey.300",
  flexShrink: 0,
};

export const commentOpenButtonStyles = {
  color: "grey.400",
  transition: "all 0.2s ease",
  "&:hover": {
    color: "common.white",
    "& img": {
      filter: "brightness(0) saturate(100%) invert(100%)",
    },
  },
};

export const commentOpenButtonIconStyles = {
  width: 30,
  height: 30,
  filter: "brightness(0) saturate(100%) invert(60%)",
  transition: "filter 0.2s ease",
};

export const commentContentTextStyles = {
  color: "grey.200",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  fontSize: { xs: "12px", sm: "13px" },
  lineHeight: { xs: 1.4, sm: 1.5 },
  ...commentTextStyles,
  "& .comment-link": {
    color: "primary.light",
    textDecoration: "underline",
    "&:hover": {
      color: "primary.main",
    },
  },
};

export const commentContentReadMoreButtonStyles = {
  mt: { xs: 0.25, sm: 0.5 },
  p: 0,
  minWidth: "auto",
  textTransform: "none",
  color: "primary.light",
  fontSize: { xs: "11px", sm: "0.75rem" },
  "&:hover": {
    bgcolor: "transparent",
    textDecoration: "underline",
  },
};

export const commentContentMediaItemStyles = {
  position: "relative",
  borderRadius: 1,
  overflow: "hidden",
  "&:hover .comment-media-overlay": {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
};

export const commentContentMediaImageStyles = {
  maxWidth: { xs: 150, sm: 200 },
  maxHeight: { xs: 150, sm: 200 },
  objectFit: "contain",
  border: "2px solid",
  borderColor: "grey.800",
  borderRadius: 1,
  minWidth: { xs: 80, sm: 100 },
  minHeight: { xs: 80, sm: 100 },
  transition: "border-color 0.2s ease",
  "&:hover": {
    borderColor: "primary.light",
  },
};

export const commentContentMediaOverlayStyles = {
  position: "absolute",
  inset: 0,
  borderRadius: 1,
  transition: "background-color 0.2s ease",
  pointerEvents: "none",
};

export const getCommentItemStyles = (
  theme: Theme,
  isOwner: boolean,
  isReply: boolean,
  isJumpHighlighted: boolean
) => {
  const isHighlighted = isOwner || isReply;
  return {
    width: "fit-content",
    maxWidth: { xs: "90%", sm: "60%", md: "70%" },
    py: { xs: 0.5, sm: 0.625 },
    px: isHighlighted ? { xs: 0.5, sm: 0.625 } : 0,
    borderRadius: isHighlighted ? { xs: 1.25, sm: 1.5 } : 0,
    borderLeft: isOwner
      ? { xs: "2px solid", sm: "2px solid" }
      : isReply
      ? { xs: "1px solid", sm: "1.5px solid" }
      : "none",
    borderLeftColor: isOwner
      ? theme.palette.primary.main
      : isReply
      ? theme.palette.grey[700]
      : "transparent",
    bgcolor: isJumpHighlighted
      ? "rgba(59, 130, 246, 0.2)"
      : isOwner
      ? alpha(theme.palette.primary.main, 0.08)
      : isReply
      ? alpha(theme.palette.grey[700], 0.15)
      : "transparent",
    transition: "background-color 1s ease",
    mx: isHighlighted ? { xs: -0.5, sm: -0.75 } : 0,
    mb: { xs: 1, sm: 1.25 },
    ...commentTextStyles,
  };
};


export const commentMediaPreviewItemContainerStyles = {
  position: "relative",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    "& .comment-media-preview-overlay": {
      opacity: 1,
    },
  },
};

export const commentMediaPreviewItemMediaStyles = {
  width: { xs: 56, sm: 64, md: 72 },
  height: { xs: 56, sm: 64, md: 72 },
  objectFit: "cover",
  borderRadius: { xs: 0.75, sm: 1 },
  border: "2px solid",
  borderColor: "grey.800",
  transition: "border-color 0.2s ease",
  "&:hover": {
    borderColor: "primary.main",
  },
};

export const commentMediaPreviewItemCloseButtonStyles = {
  position: "absolute",
  top: 0,
  right: 0,
  color: "grey.400",
  padding: "0 ",
  minWidth: "auto ",
  width: "auto ",
  height: "auto ",
  margin: "0 ",
  display: "inline-flex",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  transition: "all 0.2s ease",
  zIndex: 2,
  "& .MuiSvgIcon-root": {
    margin: 0,
  },
  "&:hover": {
    color: "common.white",
    bgcolor: "transparent",
  },
};

export const commentMediaPreviewItemCloseIconStyles = {
  fontSize: { xs: 14, sm: 16 },
};

export const commentMediaPreviewItemOverlayStyles = {
  position: "absolute",
  inset: 0,
  bgcolor: "rgba(0, 0, 0, 0.4)",
  borderRadius: { xs: 0.75, sm: 1 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s ease",
  pointerEvents: "auto",
  zIndex: 1,
  cursor: "pointer",
};

export const mediaThumbnailSizes = {
  small: 32,
  medium: 40,
} as const;

export const mediaThumbnailIconSizes = {
  small: 12,
  medium: 14,
} as const;

export const mediaThumbnailSpinnerSizes = {
  small: 12,
  medium: 16,
} as const;

export const getMediaThumbnailContainerStyles = (dimension: number) => ({
  position: "relative" as const,
  width: dimension,
  height: dimension,
  borderRadius: 1,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "grey.800",
  bgcolor: "grey.900",
});

export const mediaThumbnailMediaStyles = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

export const getMediaThumbnailVideoOverlayStyles = (iconSize: number) => ({
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "rgba(0,0,0,0.3)",
  pointerEvents: "none" as const,
  "& img": {
    width: iconSize,
    height: iconSize,
  },
});

export const getMediaThumbnailCountBadgeStyles = (dimension: number) => ({
  ...getMediaThumbnailContainerStyles(dimension),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const mediaThumbnailCountTextStyles = {
  fontWeight: 600,
  color: "grey.400",
};

export const getCommentMediaLoadingOverlayStyles = (
  loadingOverlaySx?: object
) => ({
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "grey.900",
  borderRadius: 1,
  border: "1px solid",
  borderColor: "grey.800",
  zIndex: 1,
  ...loadingOverlaySx,
});

export const commentMediaErrorOverlayStyles = {
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "grey.800",
  color: "grey.400",
  fontSize: "11px",
  textAlign: "center" as const,
  padding: 1,
  borderRadius: 1,
  border: "1px solid",
  borderColor: "grey.800",
  zIndex: 1,
};

export const commentMediaContainerStyles = {
  position: "relative" as const,
};

export const replyPreviewPaperStyles = {
  p: { xs: 1, sm: 1.5 },
  mb: { xs: 1.5, sm: 2 },
  borderLeft: { xs: "3px solid", sm: "4px solid" },
  borderColor: "primary.main",
  bgcolor: "grey.800",
  borderRadius: { xs: 1, sm: 1.5 },
};

export const parentCommentPaperStyles = {
  p: 1.5,
  mb: 1,
  borderLeft: "3px solid",
  borderColor: "primary.main",
  bgcolor: "rgba(0, 277, 106, 0.2)",
  borderRadius: 1.5,
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  "&:hover": {
    bgcolor: "rgba(0, 257, 106, 0.25)",
  },
};

export const commentPreviewClickableBoxStyles = {
  display: "flex",
  gap: 1,
  flex: 1,
  minWidth: 0,
  cursor: "pointer",
  "&:hover .reply-preview-title": {
    color: "primary.light",
  },
};

export const commentPreviewTitleStyles = {
  fontWeight: 600,
  color: "primary.main",
  transition: "color 0.2s ease",
  fontSize: { xs: "11px", sm: "12px" },
  ...commentTextStyles,
};

export const commentPreviewTextStyles = {
  fontSize: { xs: "11px", sm: "12px" },
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  lineHeight: 1.4,
  wordBreak: "break-word" as const,
  ...commentTextStyles,
  "& .comment-link": {
    color: "primary.light",
    textDecoration: "underline",
    "&:hover": {
      color: "primary.main",
    },
  },
};

export const commentPreviewMediaCountStyles = {
  fontSize: { xs: "11px", sm: "12px" },
  ...commentTextStyles,
};

export const replyPreviewCancelButtonStyles = {
  color: "grey.500",
  "&:hover": { color: "common.white" },
};

export const parentCommentTitleStyles = {
  fontWeight: 600,
  color: "primary.main",
  transition: "color 0.2s ease",
  "&:hover": { color: "primary.light" },
  ...commentTextStyles,
};

export const editPreviewPaperStyles = (theme: Theme) => ({
  p: { xs: 1, sm: 1.5 },
  mb: { xs: 1.5, sm: 2 },
  borderLeft: { xs: "3px solid", sm: "4px solid" },
  borderColor: "primary.main",
  bgcolor: alpha(theme.palette.primary.main, 0.12),
  borderRadius: { xs: 1, sm: 1.5 },
});

export const editPreviewTitleStyles = {
  fontWeight: 600,
  color: "primary.light",
  fontSize: { xs: "11px", sm: "12px" },
  ...commentTextStyles,
};

export const editPreviewSubtitleStyles = {
  fontSize: { xs: "11px", sm: "12px" },
  ...commentTextStyles,
};

export const editPreviewCancelButtonStyles = {
  color: "grey.400",
  "&:hover": { color: "common.white" },
};

export const commentActionsMenuIconButtonStyles = {
  color: "grey.400",
  "&:hover": { color: "common.white" },
};

export const commentDeleteDialogPaperStyles = {
  bgcolor: "grey.900",
  color: "common.white",
  border: "1px solid",
  borderColor: "grey.800",
};

export const commentDeleteDialogTitleStyles = {
  color: "common.white",
  ...commentTextStyles,
};

export const commentDeleteDialogContentStyles = {
  color: "grey.400",
  ...commentTextStyles,
};

export const commentDeleteDialogCancelButtonStyles = {
  color: "grey.400",
  ...commentTextStyles,
  "&:hover": {
    bgcolor: "grey.800",
  },
};

export const commentDeleteDialogDeleteButtonStyles = {
  color: "error.main",
  ...commentTextStyles,
  "&:hover": {
    bgcolor: "error.dark",
  },
};

export const ShowRepliesButtonStyles = {
  textTransform: "none",
  color: "grey.500",
  fontSize: { xs: "11px", sm: "12px" },
  padding: { xs: "2px 0", sm: "2px 0" },
  minWidth: "auto",
  textAlign: "left",
  fontWeight: 400,
  ...commentTextStyles,
  "&:hover": {
    color: "grey.300",
    backgroundColor: "transparent",
  },
  mt: { xs: 0.25, sm: 0.5 },
};

export const commentModalPaperStyles = {
  bgcolor: "grey.900",
  color: "common.white",
  display: "flex",
  flexDirection: "column",
  maxHeight: { xs: "75vh", sm: "90vh", md: "85vh", lg: "80vh" },
  height: { xs: "75vh", sm: "90vh", md: "85vh", lg: "80vh" },
  margin: { xs: "auto", sm: "32px", md: "48px", lg: "64px" },
  width: {
    xs: "100%",
    sm: "600px",
    md: "700px",
    lg: "800px",
    xl: "900px",
  },
  minWidth: { xs: "100%", sm: "600px", md: "700px" },
  maxWidth: {
    xs: "100%",
    sm: "600px",
    md: "700px",
    lg: "800px",
    xl: "900px",
  },
  borderRadius: { xs: "16px 16px 0 0", sm: 2 },
  position: { xs: "absolute", sm: "relative" },
  bottom: { xs: 0, sm: "auto" },
  top: { xs: "auto", sm: "auto" },
};

export const commentModalTitleStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: (theme: Theme) => `1px solid ${theme.palette.grey[800]}`,
  py: { xs: 1.5, sm: 2 },
  px: { xs: 2, sm: 3 },
  flexShrink: 0,
  minHeight: { xs: "56px", sm: "64px" },
};

export const commentModalCloseButtonStyles = {
  color: "grey.400",
  padding: { xs: 0.75, sm: 1 },
};

export const commentModalCloseIconStyles = {
  fontSize: { xs: "20px", sm: "24px" },
};

export const commentModalContentStyles = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  py: { xs: 1.5, sm: 3 },
  px: { xs: 1.5, sm: 3 },
  "&::-webkit-scrollbar": {
    width: { xs: "4px", sm: "6px" },
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
};

export const commentModalLoadingContainerStyles = {
  alignItems: "center",
  justifyContent: "center",
  minHeight: { xs: 150, sm: 200 },
};

export const commentModalLoadingTextStyles = {
  variant: "body2",
  color: "grey.500",
  fontSize: { xs: "13px", sm: "14px" },
};

export const commentModalEmptyTextStyles = {
  variant: "body2",
  color: "grey.500",
  fontSize: { xs: "13px", sm: "14px" },
};

export const commentModalActionsStyles = {
  display: "block",
  px: 0,
  minHeight: { xs: "auto", sm: "auto" },
  flexShrink: 0,
  borderTop: (theme: Theme) => `1px solid ${theme.palette.grey[800]}`,
  bgcolor: "grey.900",
};

export const commentModalLoginTextStyles = {
  variant: "body2",
  align: "center",
  color: "grey.500",
  fontSize: { xs: "13px", sm: "14px" },
};

export const getCommentInputSendButtonStyles = (show: boolean) => ({
  position: "absolute",
  right: { xs: "8px", sm: "10px" },
  top: "50%",
  transform: "translateY(-50%)",
  width: { xs: "16px", sm: "32px" },
  height: { xs: "16px", sm: "32px" },
  padding: 0,
  borderRadius: "50%",
  bgcolor: show ? "primary.main" : "transparent",
  color: "common.white",
  opacity: show ? 1 : 0,
  pointerEvents: show ? "auto" : "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& svg": {
    fontSize: { xs: "12px", sm: "16px" },
  },
  "&:hover": {
    bgcolor: show ? "primary.dark" : undefined,
  },
  "&:disabled": {
    bgcolor: show ? "grey.600" : undefined,
    color: "grey.400",
  },
  transition: "all 0.2s ease",
  zIndex: 1,
});

export const commentInputErrorTextStyles = {
  color: "error.main",
  fontSize: { xs: "11px", sm: "12px" },
  ...commentTextStyles,
};

export const commentMediaFileIconStyles = {
  color: "grey.400",
  flexShrink: 0,
  "&:hover": {
    color: "grey.300",
    bgcolor: "rgba(255, 255, 255, 0.05)",
  },
};

export const commentinputFormBoxStyles = {
  display: "flex",
  alignItems: "flex-end",
  gap: { xs: 0.75, sm: 1 },
  position: "relative",
};

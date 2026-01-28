import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import { z } from "zod";

import { SendIcon } from "@/components/ui/SendIcon";
import { commentSchema } from "@/lib/validatorSchemas";
import { useCommentKeyboard } from "@/routes/posts/-comments/-hooks/useCommentKeyboard";
import {
  getCommentPlaceholder,
  MAX_COMMENT_LENGTH,
} from "@/routes/posts/-comments/-utils/commentInputUtils";
import { getCommentUserName } from "@/routes/posts/-comments/-utils/commentItemUtils";
import { buildMediaItems } from "@/routes/posts/-comments/-utils/commentMediaUtils";
import {
  commentInputErrorTextStyles,
  commentinputFormBoxStyles,
  commentInputTextFieldStyles,
  commentMediaFileIconStyles,
  getCommentInputSendButtonStyles,
} from "@/routes/posts/-comments/-utils/commentStyles";
import type { CommentWithReplies } from "@/types/db";

import { useCommentInputMedia } from "../-hooks/useCommentInputMedia";
import { CommentEditPreview } from "./CommentEditPreview";
import { CommentMediaPreviewItem } from "./CommentMediaPreviewItem";
import { CommentReplyPreview } from "./CommentReplyPreview";

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentInputProps {
  postId: number;
  onSubmit: (
    text: string,
    mediaFiles?: File[],
    existingMediaUrls?: string[],
  ) => void;
  replyingTo: CommentWithReplies | null;
  onCancelReply: () => void;
  editingComment: CommentWithReplies | null;
  onCancelEdit: () => void;
  handleJumpToComment: (commentId: number) => void;
}

export function CommentInput({
  postId,
  onSubmit,
  replyingTo,
  onCancelReply,
  editingComment,
  onCancelEdit,
  handleJumpToComment,
}: CommentInputProps) {
  const fileInputId = `comment-media-input-${postId}`;

  const { control, handleSubmit, watch, setValue, reset, setFocus } =
    useForm<CommentFormData>({
      resolver: zodResolver(commentSchema),
      defaultValues: { text: "" },
    });

  const commentText = watch("text") || "";
  const isOverLimit = commentText.length > MAX_COMMENT_LENGTH;

  const {
    fileInputRef,
    selectedFiles,
    previews,
    existingMediaUrls,
    handleFileSelect,
    removeFile,
    removeExistingMedia,
    clearAll,
  } = useCommentInputMedia({ postId, editingComment });

  useEffect(() => {
    if (editingComment) {
      setValue("text", editingComment.text || "");
    } else if (!replyingTo) {
      reset();
    }
    setTimeout(() => setFocus("text"), 0);
  }, [editingComment, replyingTo, setValue, reset, setFocus]);

  const onFormSubmit = (data: CommentFormData) => {
    onSubmit(
      data.text ?? "",
      selectedFiles.length > 0 ? selectedFiles : undefined,
      existingMediaUrls.length > 0 ? existingMediaUrls : undefined,
    );
    reset();
    clearAll();
    setTimeout(() => setFocus("text"), 0);
  };

  const { handleKeyDown } = useCommentKeyboard({
    onFormSubmit: () => void handleSubmit(onFormSubmit)(),
    onCancel: () =>
      editingComment
        ? onCancelEdit()
        : replyingTo
          ? onCancelReply()
          : undefined,
  });

  const allMediaItems = buildMediaItems(
    editingComment,
    selectedFiles,
    previews,
    existingMediaUrls,
  );
  const hasContent =
    commentText.trim().length > 0 ||
    selectedFiles.length > 0 ||
    existingMediaUrls.length > 0;
  const showSendButton = hasContent && !isOverLimit;

  const handleMediaRemove = (item: (typeof allMediaItems)[number]) => {
    if (item.isExisting) {
      const idx = existingMediaUrls.indexOf(item.url);
      if (idx !== -1) removeExistingMedia(idx);
    } else {
      removeFile(item.index);
    }
  };

  return (
    <Box sx={{ p: { xs: 0.75, sm: 1 }, bgcolor: "grey.900" }}>
      {replyingTo ? (
        <CommentReplyPreview
          replyingTo={replyingTo}
          onCancel={onCancelReply}
          handleJumpToComment={handleJumpToComment}
        />
      ) : null}

      <CommentEditPreview
        editingComment={editingComment}
        onCancel={onCancelEdit}
      />

      {allMediaItems.length > 0 ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: { xs: 0.75, sm: 1 } }}
        >
          {allMediaItems.map((item) => (
            <CommentMediaPreviewItem
              key={item.id}
              item={item}
              onRemove={() => handleMediaRemove(item)}
            />
          ))}
        </Stack>
      ) : null}

      <Box component="form" sx={commentinputFormBoxStyles}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          hidden
          id={fileInputId}
        />
        <IconButton
          component="label"
          htmlFor={fileInputId}
          sx={commentMediaFileIconStyles}
          aria-label="Attach media"
        >
          <AttachFileIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
        </IconButton>

        <Box sx={{ flex: 1, position: "relative" }}>
          <Controller
            name="text"
            control={control}
            render={({ field: { ref, value, ...field } }) => (
              <TextField
                {...field}
                value={value}
                inputRef={ref}
                onFocus={(e) => {
                  if (
                    editingComment &&
                    e.target instanceof HTMLTextAreaElement
                  ) {
                    e.target.setSelectionRange(
                      e.target.value.length,
                      e.target.value.length,
                    );
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={getCommentPlaceholder(
                  editingComment,
                  replyingTo,
                  getCommentUserName(replyingTo),
                )}
                multiline
                minRows={1}
                maxRows={4}
                fullWidth
                variant="outlined"
                size="small"
                sx={commentInputTextFieldStyles}
              />
            )}
          />

          {showSendButton ? (
            <IconButton
              onClick={() => void handleSubmit(onFormSubmit)()}
              sx={getCommentInputSendButtonStyles(true)}
              aria-label="Send comment"
            >
              <SendIcon size="small" />
            </IconButton>
          ) : null}

          {isOverLimit ? (
            <Typography
              variant="caption"
              sx={{
                ...commentInputErrorTextStyles,
                position: "relative",
                bottom: { xs: "-18px", sm: "-20px" },
                left: 0,
              }}
            >
              Limit exceeded
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

///вынести

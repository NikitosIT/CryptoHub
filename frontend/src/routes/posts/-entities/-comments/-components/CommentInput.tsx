import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import type { z } from 'zod';

import { SendIcon } from '@/components/ui/SendIcon';
import { commentSchema } from '@/lib/validatorSchemas';
import { useCommentKeyboard } from '@/routes/posts/-entities/-comments/-hooks/useCommentKeyboard';
import {
  getCommentPlaceholder,
  MAX_COMMENT_LENGTH,
} from '@/routes/posts/-entities/-comments/-utils/commentInputUtils';
import { getCommentUserName } from '@/routes/posts/-entities/-comments/-utils/commentItemUtils';

import { useCommentInputMedia } from '../-hooks/useCommentInputMedia';
import { CommentEditPreview } from './CommentEditPreview';
import { CommentMediaPreviewItem } from './CommentMediaPreviewItem';
import { CommentReplyPreview } from './CommentReplyPreview';
import { useCommentContext } from './comments-context';

type CommentFormData = z.infer<typeof commentSchema>;

export const COMMENT_INPUT_ID = 'comment-dialog-text-input';

export function CommentInput() {
  const {
    postId,
    handleSubmit: onSubmit,
    replyingTo,
    editingComment,
  } = useCommentContext();

  const fileInputId = `comment-media-input-${postId}`;

  const { control, handleSubmit, watch, reset, setFocus, setValue } =
    useForm<CommentFormData>({
      resolver: zodResolver(commentSchema),
      defaultValues: { text: '' },
    });

  const commentText = watch('text') ?? '';
  const isOverLimit = commentText.length > MAX_COMMENT_LENGTH;

  const {
    fileInputRef,
    selectedFiles,
    allMediaItems,
    existingMediaUrls,
    handleFileSelect,
    clearAll,
    handleMediaRemove,
  } = useCommentInputMedia();

  useEffect(() => {
    setValue('text', editingComment?.text ?? '');
    setFocus('text');
  }, [editingComment, setValue, setFocus]);

  useEffect(() => {
    setFocus('text');
  }, [replyingTo, setFocus]);

  const onFormSubmit = (data: CommentFormData) => {
    onSubmit(
      data.text ?? '',
      selectedFiles.length > 0 ? selectedFiles : undefined,
      existingMediaUrls.length > 0 ? existingMediaUrls : undefined,
    );
    reset();
    clearAll();
    setFocus('text');
  };

  const { handleKeyDown } = useCommentKeyboard({
    onFormSubmit: async () => handleSubmit(onFormSubmit)(),
  });

  const hasContent =
    commentText.trim().length > 0 ||
    selectedFiles.length > 0 ||
    existingMediaUrls.length > 0;
  const showSendButton = hasContent && !isOverLimit;

  return (
    <Box sx={{ p: { xs: 0.75, sm: 1 }, bgcolor: 'grey.900' }}>
      <CommentReplyPreview />

      <CommentEditPreview />

      {allMediaItems.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: { xs: 0.75, sm: 1 } }}>
          {allMediaItems.map((item) => (
            <CommentMediaPreviewItem
              key={item.id}
              item={item}
              onRemove={() => {
                handleMediaRemove(item);
              }}
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

        <Box sx={{ flex: 1, position: 'relative' }}>
          <Controller
            name="text"
            control={control}
            render={({ field: { ref, value, ...field } }) => (
              <TextField
                {...field}
                value={value}
                inputRef={ref}
                slotProps={{ input: { id: COMMENT_INPUT_ID } }}
                onKeyDown={handleKeyDown}
                placeholder={getCommentPlaceholder(
                  editingComment,
                  replyingTo,
                  getCommentUserName(replyingTo),
                )}
                multiline
                fullWidth
                variant="outlined"
                size="small"
                sx={commentInputTextFieldStyles}
              />
            )}
          />

          {showSendButton ? (
            <IconButton
              onClick={async () => handleSubmit(onFormSubmit)()}
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
                position: 'relative',
                bottom: { xs: '-18px', sm: '-20px' },
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

const COMMENT_FONT_FAMILY = 'Inter, sans-serif';

const commentTextStyles = {
  fontFamily: COMMENT_FONT_FAMILY,
};

const commentInputTextFieldStyles = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'grey.800',
    color: 'common.white',
    ...commentTextStyles,
    fontSize: { xs: '16px', sm: '14px' },
    paddingRight: { xs: '48px', sm: '52px' },
    borderRadius: { xs: '20px', sm: '8px' },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
  },
};

const commentMediaFileIconStyles = {
  color: 'grey.400',
  flexShrink: 0,
  '&:hover': {
    color: 'grey.300',
    bgcolor: 'rgba(255, 255, 255, 0.05)',
  },
};

const commentinputFormBoxStyles = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: { xs: 0.75, sm: 1 },
  position: 'relative',
};

const getCommentInputSendButtonStyles = (show: boolean) => ({
  position: 'absolute',
  right: { xs: '8px', sm: '10px' },
  top: '50%',
  transform: 'translateY(-50%)',
  width: { xs: '16px', sm: '32px' },
  height: { xs: '16px', sm: '32px' },
  padding: 0,
  borderRadius: '50%',
  bgcolor: show ? 'primary.main' : 'transparent',
  color: 'common.white',
  opacity: show ? 1 : 0,
  pointerEvents: show ? 'auto' : 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '&:hover': {
    bgcolor: show ? 'primary.dark' : undefined,
  },
  transition: 'all 0.2s ease',
  zIndex: 1,
});

const commentInputErrorTextStyles = {
  color: 'error.main',
  fontSize: { xs: '11px', sm: '12px' },
  ...commentTextStyles,
};

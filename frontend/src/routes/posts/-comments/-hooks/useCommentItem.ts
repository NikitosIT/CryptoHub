import { useState } from 'react';

import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import type { CommentProps } from '@/types/db';

import { isCommentOwner } from '../-utils/commentItemUtils';

export function useCommentItem({ comment }: CommentProps) {
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const { user } = useAuthState();

  const handleMediaClick = (mediaUrl: string, mediaType: 'photo' | 'video') => {
    if (mediaType === 'photo') {
      setPreviewMedia(mediaUrl);
    }
  };

  const isOwner = user?.id ? isCommentOwner(comment, user.id) : false;

  return {
    previewMedia,
    handleMediaClick,
    handleCloseMediaPreview: () => setPreviewMedia(null),
    isOwner,
  };
}

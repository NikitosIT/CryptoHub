import { api } from '@/api';

export async function uploadCommentMedia({ mediaFiles }: { mediaFiles?: File[] }) {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  return await api.comments.uploadMedia(mediaFiles);
}

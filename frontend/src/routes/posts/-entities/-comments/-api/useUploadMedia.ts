import { api } from '@/api';
import type { CommentMedia } from '@/routes/posts/-entities/-comments/-types';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '@/routes/posts/-entities/-comments/constants/comments';

export async function uploadCommentMedia({
  mediaFiles,
}: {
  mediaFiles?: File[];
}): Promise<CommentMedia[]> {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  const uploadPromises = mediaFiles.map(async (file) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error(
        `Unsupported file type "${file.name}". Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, MOV) are allowed`,
      );
    }

    const fileId = crypto.randomUUID();
    const ext =
      file.name.split('.').pop() ?? (file.type.startsWith('video/') ? 'mp4' : 'jpg');
    const filename = `${fileId}.${ext}`;

    await api.comments.uploadMedia(file, filename);

    return {
      type: file.type.startsWith('video/') ? 'video' : 'photo',
      url: filename,
    } satisfies CommentMedia;
  });

  return Promise.all(uploadPromises);
}

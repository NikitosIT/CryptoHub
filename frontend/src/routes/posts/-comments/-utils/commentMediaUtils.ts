import { env } from '@/config/env';
import { COMMENT_MEDIA_BUCKET } from '@/constants/storage';
import type { CommentMedia, CommentWithReplies } from '@/types/db';

const ABSOLUTE_URL_PREFIXES = ['blob:', 'http://', 'https://', '/'];

export type MediaItem = {
  id: string;
  type: 'photo' | 'video';
  url: string;
  index: number;
  isExisting: boolean;
};

export function getCommentMediaFullUrl(
  mediaItem: { url: string } | null | undefined,
): string {
  if (!mediaItem?.url) return '';

  const url = mediaItem.url.trim();
  if (ABSOLUTE_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return url;
  }

  return `${env.supabaseUrl}/storage/v1/object/public/${COMMENT_MEDIA_BUCKET}/${url}`;
}

function fileToMediaType(file: File): 'photo' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'photo';
}

export function buildMediaItems(
  editingComment: CommentWithReplies | null,
  selectedFiles: File[],
  previews: string[],
  existingMediaUrls: string[],
): MediaItem[] {
  const existingUrlSet = new Set(existingMediaUrls);

  const existingItems: MediaItem[] =
    editingComment?.media
      ?.filter((m) => existingUrlSet.has(m.url))
      .map((m, i) => ({
        id: `existing-${m.url}`,
        type: m.type,
        url: m.url,
        index: i,
        isExisting: true,
      })) ?? [];

  const newItems: MediaItem[] = selectedFiles
    .map((file, i) =>
      previews[i]
        ? {
            id: `new-${previews[i]}`,
            type: fileToMediaType(file),
            url: previews[i],
            index: i,
            isExisting: false,
          }
        : null,
    )
    .filter((item): item is MediaItem => item !== null);

  return [...existingItems, ...newItems];
}

export function createBlobMediaFromFiles(mediaFiles?: File[]): {
  media: CommentMedia[];
  blobUrls: string[];
} {
  if (!mediaFiles?.length) {
    return { media: [], blobUrls: [] };
  }

  const blobUrls = mediaFiles.map((f) => URL.createObjectURL(f));
  const media: CommentMedia[] = mediaFiles.map((f, i) => ({
    type: fileToMediaType(f),
    url: blobUrls[i],
  }));

  return { media, blobUrls };
}

export function getExistingMedia(
  comments: CommentWithReplies[] | undefined,
  commentId: number,
  existingMediaUrls: string[],
): CommentMedia[] {
  const comment = comments?.find((c) => c.id === commentId);
  if (!comment?.media) return [];

  const urlSet = new Set(existingMediaUrls);
  return comment.media.filter((m) => urlSet.has(m.url));
}

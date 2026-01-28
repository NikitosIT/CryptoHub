import { COMMENT_MEDIA_BUCKET } from "@/constants/storage";
import type { CommentMedia, CommentWithReplies } from "@/types/db";

const ABSOLUTE_URL_PREFIXES = ["blob:", "http://", "https://", "/"];

export function getCommentMediaFullUrl(
  mediaItem: { url: string } | null | undefined,
): string {
  if (!mediaItem?.url) return "";

  const url = mediaItem.url.trim();
  if (ABSOLUTE_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return url;
  }

  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${COMMENT_MEDIA_BUCKET}/${url}`;
}

type MediaItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  index: number;
  isExisting: boolean;
};

export function buildMediaItems(
  editingComment: CommentWithReplies | null,
  selectedFiles: File[],
  previews: string[],
  existingMediaUrls: string[],
): MediaItem[] {
  const items: MediaItem[] = [];

  if (editingComment?.media && existingMediaUrls.length > 0) {
    const existingUrlSet = new Set(existingMediaUrls);
    editingComment.media
      .filter((m) => existingUrlSet.has(m.url))
      .forEach((m) => {
        items.push({
          id: `existing-${m.url}`,
          type: m.type,
          url: m.url,
          index: items.length,
          isExisting: true,
        });
      });
  }

  selectedFiles.forEach((file, i) => {
    if (previews[i]) {
      items.push({
        id: `new-${previews[i]}`,
        type: file.type.startsWith("video/") ? "video" : "photo",
        url: previews[i],
        index: i,
        isExisting: false,
      });
    }
  });

  return items;
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
    type: f.type.startsWith("video/") ? "video" : "photo",
    url: blobUrls[i],
  }));

  return { media, blobUrls };
}

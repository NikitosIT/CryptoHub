import { api } from "@/api";
import type { CommentMedia } from "@/types/db";

export async function uploadCommentMedia({
  mediaFiles,
}: {
  mediaFiles?: File[];
}): Promise<CommentMedia[]> {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  return await api.comments.uploadMedia(mediaFiles);
}

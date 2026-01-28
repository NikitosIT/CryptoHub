import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";

const COMMENT_MEDIA_BUCKET = "comment_media";

function extractFilename(url: string): string {
  if (!url.includes("/") && !url.startsWith("http")) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[pathParts.length - 1] || url;
  } catch {
    return url;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  const allFiles: Array<{ name: string }> = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: items, error: listError } = await supabase.storage
      .from(COMMENT_MEDIA_BUCKET)
      .list(undefined, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) throw listError;

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          allFiles.push({ name: item.name });
        }
      }

      hasMore = items.length === limit;
      offset += limit;
    } else {
      hasMore = false;
    }
  }

  try {
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("media")
      .not("media", "is", null);

    if (commentsError) throw commentsError;

    const expectedFiles = new Set<string>();
    if (comments) {
      for (const comment of comments) {
        if (comment.media && Array.isArray(comment.media)) {
          for (const mediaItem of comment.media) {
            if (mediaItem && typeof mediaItem === "object" && mediaItem.url) {
              const filename = extractFilename(mediaItem.url);
              expectedFiles.add(filename);

              if (mediaItem.thumbnail_url) {
                const thumbnailFilename = extractFilename(mediaItem.thumbnail_url);
                expectedFiles.add(thumbnailFilename);
              }
            }
          }
        }
      }
    }

    if (allFiles.length === 0) {
      return jsonResponse({
        success: true,
        checked: 0,
        deleted: 0,
        message: "No files found in storage",
      });
    }

    const filesToDelete: string[] = [];
    for (const file of allFiles) {
      if (!expectedFiles.has(file.name)) {
        filesToDelete.push(file.name);
      }
    }

    let deletedCount = 0;
    const batchSize = 100;

    if (filesToDelete.length > 0) {
      for (let i = 0; i < filesToDelete.length; i += batchSize) {
        const batch = filesToDelete.slice(i, i + batchSize);
        const { data: deletedFiles, error: deleteError } = await supabase
          .storage
          .from(COMMENT_MEDIA_BUCKET)
          .remove(batch);

        if (deleteError) {
          safeLogError(
            new Error(`Failed to delete batch: ${deleteError.message}`),
            "cleanup-unused-comment-media",
          );
        } else {
          deletedCount += deletedFiles?.length || 0;
        }
      }
    }

    return jsonResponse({
      success: true,
      checked: allFiles.length,
      deleted: deletedCount,
      expected: expectedFiles.size,
      message: `Cleaned up ${deletedCount} unused comment media file(s)`,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "cleanup-unused-comment-media");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

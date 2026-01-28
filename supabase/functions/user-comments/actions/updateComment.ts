import { supabase } from "../../shared/supabaseApi.ts";
import {
  errorResponse,
  jsonResponse,
  normalizeComment,
  RawComment,
  RequestBody,
} from "../utils.ts";
import { verifyUserId } from "../../shared/auth.ts";
import { sanitizeText, sanitizeUrl } from "../../shared/sanitize.ts";
import { safeLogError } from "../../shared/logger.ts";

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

export async function handleUpdateComment(req: Request, body: RequestBody) {
  try {
    const user_id = await verifyUserId(req, body.user_id);
    const { comment_id, text, media } = body;

    if (!comment_id || (!text && !media)) {
      return errorResponse("Missing comment_id or both text and media", 400);
    }

    const sanitizedText = sanitizeText(text);
    if (sanitizedText.length > 1000) {
      return errorResponse("Comment text cannot exceed 1000 characters", 400);
    }

    if (!sanitizedText && (!media || media.length === 0)) {
      return errorResponse("Comment must have text or media", 400);
    }

    if (media && Array.isArray(media)) {
      if (media.length > 10) {
        return errorResponse("Maximum 10 media files per comment", 400);
      }

      for (const mediaItem of media) {
        if (!mediaItem || typeof mediaItem !== "object") {
          return errorResponse("Invalid media format", 400);
        }

        if (mediaItem.type !== "photo" && mediaItem.type !== "video") {
          return errorResponse("Media type must be 'photo' or 'video'", 400);
        }

        if (!mediaItem.url || typeof mediaItem.url !== "string") {
          return errorResponse(
            "Media URL is required and must be a string",
            400
          );
        }

        const expectedBucket = "comment_media";
        const isFilename =
          !mediaItem.url.includes("/") && !mediaItem.url.startsWith("http");
        const isFullUrl = mediaItem.url.includes(expectedBucket);

        if (!isFilename && !isFullUrl) {
          return errorResponse("Invalid media URL", 400);
        }

        if (isFullUrl) {
          const sanitizedMediaUrl = sanitizeUrl(mediaItem.url);
          if (!sanitizedMediaUrl) {
            return errorResponse("Invalid or dangerous media URL", 400);
          }

          mediaItem.url = sanitizedMediaUrl;
        }
      }
    }

    const { data: existing } = await supabase
      .from("comments")
      .select("user_id, media")
      .eq("id", comment_id)
      .single();

    if (!existing || existing.user_id !== user_id) {
      return errorResponse("Unauthorized", 403);
    }

    const keptMediaUrls = new Set<string>();
    if (media && Array.isArray(media)) {
      for (const mediaItem of media) {
        if (mediaItem?.url) {
          const filename = extractFilename(mediaItem.url);
          keptMediaUrls.add(filename);
        }
      }
    }

    const filesToDelete: string[] = [];
    if (existing.media && Array.isArray(existing.media)) {
      for (const oldMediaItem of existing.media) {
        if (
          oldMediaItem &&
          typeof oldMediaItem === "object" &&
          oldMediaItem.url
        ) {
          const oldFilename = extractFilename(oldMediaItem.url);

          if (!keptMediaUrls.has(oldFilename)) {
            filesToDelete.push(oldFilename);

            if (oldMediaItem.thumbnail_url) {
              const thumbnailFilename = extractFilename(
                oldMediaItem.thumbnail_url
              );
              filesToDelete.push(thumbnailFilename);
            }
          }
        }
      }
    }

    if (filesToDelete.length > 0) {
      const { error: deleteMediaError } = await supabase.storage
        .from(COMMENT_MEDIA_BUCKET)
        .remove(filesToDelete);

      if (deleteMediaError) {
        safeLogError(
          new Error(
            `Failed to delete old comment media: ${deleteMediaError.message}`
          ),
          "updateComment"
        );
      }
    }

    const { data: commentData, error } = await supabase
      .from("comments")
      .update({
        text: sanitizedText,
        media: media || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment_id)
      .select("*")
      .single();

    if (error) throw error;

    const normalizedComment = normalizeComment(commentData as RawComment);

    const { data: userReaction } = await supabase
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", comment_id)
      .eq("user_id", user_id)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, profile_logo")
      .eq("id", user_id)
      .maybeSingle();

    const data = {
      ...normalizedComment,
      user_has_liked: !!userReaction,
      user: {
        raw_user_meta_data: {
          nickname: profile?.nickname || null,
          avatar_url: profile?.profile_logo || null,
        },
      },
    };

    return jsonResponse({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    throw err;
  }
}

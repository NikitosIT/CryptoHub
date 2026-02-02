import { createSupabaseClient, supabase } from "../../shared/supabaseApi.ts";
import {
  errorResponse,
  jsonResponse,
  normalizeComment,
  RawComment,
  RequestBody,
} from "../utils.ts";
import { checkRateLimit } from "../../shared/rateLimiter.ts";
import { sanitizeText, sanitizeUrl } from "../../shared/sanitize.ts";

export async function handleCreateComment(req: Request, body: RequestBody) {
  try {
    const supabaseClient = createSupabaseClient(req);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const userId = user?.id;

    await checkRateLimit("create_comment", {
      maxRequests: 10,
      windowMs: 60 * 1000,
    });

    const { post_id, parent_comment_id, text, media } = body;

    if (!post_id) {
      return errorResponse("Missing post_id", 400);
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
            400,
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

    const { data: commentData, error } = await supabase
      .from("comments")
      .insert([
        {
          user_id: userId,
          post_id,
          parent_comment_id: parent_comment_id || null,
          text: sanitizedText,
          media: media || null,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    const normalizedComment = normalizeComment(commentData as RawComment);

    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, profile_logo")
      .eq("id", userId)
      .maybeSingle();

    const data = {
      ...normalizedComment,
      user_has_liked: false,
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

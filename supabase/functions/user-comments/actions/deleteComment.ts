import { createSupabaseClient, supabase } from "../../shared/supabaseApi.ts";
import { errorResponse, jsonResponse, RequestBody } from "../utils.ts";
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

export async function handleDeleteComment(req: Request, body: RequestBody) {
  try {
    const supabaseClient = createSupabaseClient(req);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    const userId = user?.id;

    const { comment_id } = body;

    if (!comment_id) {
      return errorResponse("Missing comment_id", 400);
    }

    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, media")
      .eq("id", comment_id)
      .single();

    if (!comment) {
      return errorResponse("Comment not found", 404);
    }

    if (comment.user_id !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    if (comment.media && Array.isArray(comment.media)) {
      const filesToDelete: string[] = [];

      for (const mediaItem of comment.media) {
        if (mediaItem && typeof mediaItem === "object" && mediaItem.url) {
          const filename = extractFilename(mediaItem.url);
          filesToDelete.push(filename);

          if (mediaItem.thumbnail_url) {
            const thumbnailFilename = extractFilename(mediaItem.thumbnail_url);
            filesToDelete.push(thumbnailFilename);
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
              `Failed to delete comment media: ${deleteMediaError.message}`,
            ),
            "deleteComment",
          );
        }
      }
    }

    const { error: updateRepliesError } = await supabase
      .from("comments")
      .update({ parent_comment_id: null })
      .eq("parent_comment_id", comment_id);

    if (updateRepliesError) throw updateRepliesError;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment_id);

    if (error) throw error;

    return jsonResponse({ success: true });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    throw err;
  }
}

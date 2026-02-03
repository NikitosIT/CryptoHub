import { createSupabaseClient, supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";
import { safeLogError } from "../shared/logger.ts";

function parseCommentId(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  throw new Error("Invalid comment_id provided");
}

async function getCommentLikeCount(commentId: number) {
  const { data, error } = await supabase
    .from("comments")
    .select("like_count")
    .eq("id", commentId)
    .maybeSingle();

  if (error) throw error;
  return data?.like_count ?? 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }
  const supabaseClient = createSupabaseClient(req);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const userId = user?.id;

  try {
    const body = await parseRequestBody<{
      comment_id?: unknown;
    }>(req);

    const validation = validateRequiredFields(body, ["comment_id"]);
    if (!validation.valid) {
      return errorResponse(validation.error);
    }

    const normalizedCommentId = parseCommentId(body.comment_id);

    const { data: existing, error: selectError } = await supabase
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", normalizedCommentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error: deleteError } = await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;

      const likeCount = await getCommentLikeCount(normalizedCommentId);

      return jsonResponse({
        success: true,
        status: "removed",
        like_count: likeCount,
      });
    }

    const { error: insertError } = await supabase
      .from("comment_reactions")
      .insert([{ comment_id: normalizedCommentId, user_id: userId }]);

    if (insertError) throw insertError;

    const likeCount = await getCommentLikeCount(normalizedCommentId);

    return jsonResponse({
      success: true,
      status: "added",
      like_count: likeCount,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "users-comments-like");
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";
    return errorResponse(errorMessage, 500);
  }
});

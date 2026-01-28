import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";
import { safeLogError } from "../shared/logger.ts";
import { verifyUserId } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const body = await parseRequestBody<{
      user_id?: string;
      post_id?: number;
      reaction_type?: string;
    }>(req);

    const validation = validateRequiredFields(body, [
      "user_id",
      "post_id",
      "reaction_type",
    ]);
    if (!validation.valid) {
      return errorResponse(validation.error);
    }

    const user_id = await verifyUserId(req, body.user_id);
    const { post_id, reaction_type } = body;

    const { data: existing, error: selectError } = await supabase
      .from("reactions")
      .select("*")
      .eq("user_id", user_id)
      .eq("post_id", post_id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      if (existing.reaction_type === reaction_type) {
        const { error: delError } = await supabase
          .from("reactions")
          .delete()
          .eq("id", existing.id);
        if (delError) throw delError;
      } else {
        const { error: updError } = await supabase
          .from("reactions")
          .update({ reaction_type })
          .eq("id", existing.id);
        if (updError) throw updError;
      }
    } else {
      const { error: insError } = await supabase
        .from("reactions")
        .insert([{ user_id, post_id, reaction_type }]);
      if (insError) throw insError;
    }

    const { data: counts, error: countError } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", post_id);

    if (countError) throw countError;

    const likeCount = counts.filter((r) => r.reaction_type === "like").length;
    const dislikeCount = counts.filter((r) =>
      r.reaction_type === "dislike"
    ).length;

    const { error: updatePostError } = await supabase
      .from("telegram_posts")
      .update({ like_count: likeCount, dislike_count: dislikeCount })
      .eq("id", post_id);

    if (updatePostError) throw updatePostError;

    return jsonResponse({
      success: true,
      post_id,
      like_count: likeCount,
      dislike_count: dislikeCount,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "toggle-reactions");
    const errorMessage = err instanceof Error
      ? err.message
      : "Unexpected error";
    return errorResponse(errorMessage, 500);
  }
});

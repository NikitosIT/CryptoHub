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
      post_id?: number;
      user_id?: string;
    }>(req);

    const validation = validateRequiredFields(body, ["post_id", "user_id"]);
    if (!validation.valid) {
      return errorResponse(validation.error);
    }

    const user_id = await verifyUserId(req, body.user_id);
    const { post_id } = body;

    const { data: existing, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;

      return jsonResponse({ success: true, status: "removed" });
    } else {
      const { error: insertError } = await supabase
        .from("favorites")
        .insert([{ post_id, user_id }]);

      if (insertError) throw insertError;

      return jsonResponse({
        success: true,
        status: "added",
        is_favorite: true,
      });
    }
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "toggle-favorites");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

import { supabaseAdmin } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { jsonResponse } from "../shared/responses.ts";
import { requireAuth } from "../shared/auth.ts";
import { safeLogError } from "../shared/logger.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const { userId } = await requireAuth(req);
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("two_factor_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      safeLogError(fetchError, "clear-2fa-verification: fetch error");
      throw fetchError;
    }

    if (!profile?.two_factor_enabled) {
      return jsonResponse({
        success: true,
        message: "2FA is not enabled, nothing to clear",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_2fa_verified: false })
      .eq("id", userId);

    if (updateError) {
      safeLogError(updateError, "clear-2fa-verification: update error");
      throw updateError;
    }

    return jsonResponse({
      success: true,
      message: "2FA verification cleared",
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }
    safeLogError(error, "clear-2fa-verification");
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return jsonResponse(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

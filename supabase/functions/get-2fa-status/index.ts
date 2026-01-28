import { createSupabaseClient, supabaseAdmin } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const supabase = createSupabaseClient(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return jsonResponse({
        enabled: false,
        is_verified_for_current_session: false,
      });
    }

    const userId = user.id;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("two_factor_enabled, is_2fa_verified")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      safeLogError(error, "get-2fa-status: fetch error");
      return jsonResponse({
        enabled: false,
        is_verified_for_current_session: false,
      });
    }

    const isTwoFactorEnabled = Boolean(profile?.two_factor_enabled);

    if (!isTwoFactorEnabled) {
      return jsonResponse({
        enabled: false,
        is_verified_for_current_session: true,
      });
    }

    const isVerifiedForCurrentSession = Boolean(profile?.is_2fa_verified);

    return jsonResponse({
      enabled: true,
      is_verified_for_current_session: isVerifiedForCurrentSession,
    });
  } catch (error: unknown) {
    safeLogError(error, "get-2fa-status");
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return jsonResponse(
      {
        enabled: false,
        is_verified_for_current_session: false,
        error: errorMessage,
      },
      500,
    );
  }
});

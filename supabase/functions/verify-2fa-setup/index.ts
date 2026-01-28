import { supabaseAdmin } from "../shared/supabaseApi.ts";
import * as OTPAuth from "OTPauth";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { parseRequestBody } from "../shared/request.ts";
import { requireAuth } from "../shared/auth.ts";
import { safeLogError } from "../shared/logger.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const body = await parseRequestBody<{ code?: string }>(req);
    const { code } = body;

    if (!code) {
      return errorResponse("Code is required");
    }

    const { userId } = await requireAuth(req);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("two_factor_secret")
      .eq("id", userId)
      .single();

    if (error || !data?.two_factor_secret) {
      return errorResponse("2FA not initialized");
    }

    const totp = new OTPAuth.TOTP({
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(data.two_factor_secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      return errorResponse("Invalid code");
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        two_factor_enabled: true,
        is_2fa_verified: true,
      })
      .eq("id", userId);

    return jsonResponse({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }
    safeLogError(error, "verify-2fa-setup");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

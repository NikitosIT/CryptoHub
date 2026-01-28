import { supabaseAdmin } from "../shared/supabaseApi.ts";
import * as OTPAuth from "OTPauth";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { parseRequestBody } from "../shared/request.ts";
import { requireAuth } from "../shared/auth.ts";
import { safeLogError } from "../shared/logger.ts";
import { checkVerificationRateLimit } from "../shared/rateLimiter.ts";

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

    let rateLimitResult;
    try {
      rateLimitResult = await checkVerificationRateLimit(
        userId,
        "verify_2fa",
        {
          maxRequests: 5,
          windowMs: 5 * 60 * 1000,
        },
        false,
      );
    } catch (rateLimitError) {
      if (rateLimitError instanceof Response) {
        return rateLimitError;
      }
      throw rateLimitError;
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("two_factor_secret, two_factor_enabled")
      .eq("id", userId)
      .single();

    if (error || !data?.two_factor_enabled) {
      return errorResponse("2FA not enabled");
    }

    const totp = new OTPAuth.TOTP({
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(data.two_factor_secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      try {
        const failedRateLimit = await checkVerificationRateLimit(
          userId,
          "verify_2fa",
          {
            maxRequests: 5,
            windowMs: 5 * 60 * 1000,
          },
          true,
        );

        return jsonResponse(
          {
            error: `Invalid code. ${failedRateLimit.remainingAttempts} attempt${
              failedRateLimit.remainingAttempts !== 1 ? "s" : ""
            } remaining.`,
            remainingAttempts: failedRateLimit.remainingAttempts,
          },
          400,
        );
      } catch (rateLimitError) {
        if (rateLimitError instanceof Response) {
          return rateLimitError;
        }
        throw rateLimitError;
      }
    }

    const { error: updateError, data: updateData } = await supabaseAdmin
      .from("profiles")
      .update({ is_2fa_verified: true })
      .eq("id", userId)
      .select("is_2fa_verified")
      .single();

    if (updateError) {
      safeLogError(updateError, "verify-login-2fa: update error");
      throw updateError;
    }

    if (updateData?.is_2fa_verified !== true) {
      safeLogError(
        "Update succeeded but is_2fa_verified is not true",
        "verify-login-2fa",
      );
      throw new Error("Failed to update verification status");
    }

    return jsonResponse({
      verified: true,
      is_verified_for_current_session: true,
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }
    safeLogError(error, "verify-login-2fa");
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

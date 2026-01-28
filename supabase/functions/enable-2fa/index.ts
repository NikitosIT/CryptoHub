import { supabaseAdmin } from "../shared/supabaseApi.ts";
import * as OTPAuth from "OTPauth";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { requireAuth } from "../shared/auth.ts";
import { safeLogError } from "../shared/logger.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const { userId } = await requireAuth(req);

    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
      label: "CryptoHub",
    });

    const otpauth = totp.toString();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${
      encodeURIComponent(
        otpauth,
      )
    }&size=200x200`;

    await supabaseAdmin
      .from("profiles")
      .update({
        two_factor_secret: secret.base32,
        is_2fa_verified: false,
      })
      .eq("id", userId);

    return jsonResponse({ qrUrl });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }
    safeLogError(error, "enable-2fa");
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

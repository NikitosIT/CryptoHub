import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";
import { getAuthenticatedUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405, req);
    }

    const { userId } = await getAuthenticatedUser(req);

    const body = await parseRequestBody<{
      admin_msg?: string;
      msg?: string;
    }>(req);

    const validation = validateRequiredFields(body, ["admin_msg", "msg"]);
    if (!validation.valid) {
      return errorResponse(validation.error, 400, req);
    }

    const adminMsg = body.admin_msg!.trim();
    const msg = body.msg!.trim();

    if (!adminMsg || !msg) {
      return errorResponse("admin_msg and msg are required", 400, req);
    }

    const { error } = await supabase.from("notification_to_admin").insert({
      user_id: userId,
      admin_msg: adminMsg,
      msg,
    });

    if (error) {
      safeLogError(error, "users_notifications: insert");
      return errorResponse(error.message || "Failed to send reply", 500, req);
    }

    return jsonResponse({ success: true }, 200, req);
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "users_notifications");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500, req);
  }
});

import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";
import { getAuthenticatedUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const { userId } = await getAuthenticatedUser(req);

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!adminRow) {
      return errorResponse("Forbidden", 403);
    }

    const body = await parseRequestBody<{
      send_to?: string;
      send_to_all?: boolean;
      msg?: string;
      links?: unknown;
    }>(req);

    const msg = body.msg?.trim() ?? null;
    const links = body.links != null ? body.links : null;

    if (body.send_to_all === true) {
      if (!msg) {
        return errorResponse("Message is required when sending to all", 400);
      }
      const { error } = await supabase.from("notification_users").insert({
        send_to: null,
        send_to_all: true,
        msg,
        links,
      });
      if (error) {
        safeLogError(error, "admin_notifications: insert broadcast");
        return errorResponse(
          error.message || "Failed to send notification",
          500,
        );
      }
      return jsonResponse({ success: true });
    }

    const validation = validateRequiredFields(body, ["send_to"]);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const sendTo = body.send_to!.trim();

    const { error } = await supabase.from("notification_users").insert({
      send_to: sendTo,
      send_to_all: false,
      msg,
      links,
    });

    if (error) {
      safeLogError(error, "admin_notifications: insert");
      return errorResponse(error.message || "Failed to send notification", 500);
    }

    return jsonResponse({ success: true });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "admin_notifications");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

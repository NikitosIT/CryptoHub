import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";
import { parseRequestBody } from "../shared/request.ts";
import { supabase } from "../shared/supabaseApi.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const body = await parseRequestBody<{ email?: string }>(req);

    if (!body.email) {
      return errorResponse("Email is required", 400);
    }

    const email = body.email.toLowerCase().trim();

    const { data: adminUser, error: checkError } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      safeLogError(checkError, "admin-auth: check-email");
      return errorResponse("Failed to check email", 500);
    }

    if (!adminUser) {
      return errorResponse("Invalid credentials", 401);
    }

    return jsonResponse({
      success: true,
      exists: true,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "admin-auth");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

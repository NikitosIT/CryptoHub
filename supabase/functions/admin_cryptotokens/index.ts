import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";
import { parseRequestBody } from "../shared/request.ts";
import { getAuthenticatedUser } from "../shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (req.method !== "POST" && req.method !== "DELETE") {
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
      token_name?: string;
      token_names?: string[];
    }>(req);

    const single = body.token_name?.trim();
    const multiple = Array.isArray(body.token_names)
      ? body.token_names.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)
      : [];

    const tokenNames = [...new Set([single, ...multiple].filter(Boolean))];

    if (tokenNames.length === 0) {
      return errorResponse("token_name or token_names is required", 400);
    }

    if (req.method === "DELETE") {
      const { error, count } = await supabase
        .from("cryptotokens")
        .delete({ count: "exact" })
        .in("token_name", tokenNames);

      if (error) {
        safeLogError(error, "admin_cryptotokens: delete");
        return errorResponse(error.message || "Failed to delete tokens", 500);
      }

      return jsonResponse({
        success: true,
        message: "Tokens deleted",
        requested: tokenNames.length,
        deleted: count ?? 0,
      });
    }

    const rows = tokenNames.map((token_name) => ({ token_name }));

    const { error } = await supabase
      .from("cryptotokens")
      .upsert(rows, { onConflict: "token_name", ignoreDuplicates: true });

    if (error) {
      safeLogError(error, "admin_cryptotokens: upsert");
      return errorResponse(error.message || "Failed to insert tokens", 500);
    }

    return jsonResponse({
      success: true,
      message: "Tokens processed",
      count: tokenNames.length,
    });
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "admin_cryptotokens");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

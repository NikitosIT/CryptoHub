import { supabase } from "../shared/supabaseApi.ts";
import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";
import { parseRequestBody, validateRequiredFields } from "../shared/request.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const body = await parseRequestBody<{
      action?: string;
      forecastId?: number;
      status?: "approved" | "rejected";
      forecast_text?: string;
    }>(req);

    if (body.action === "list") {
      const { data, error } = await supabase
        .from("token_forecasts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        safeLogError(error, "admin-forecasts: list");
        return errorResponse(error.message || "Failed to fetch forecasts", 500);
      }

      return jsonResponse({
        success: true,
        forecasts: data || [],
      });
    }

    if (body.action === "update") {
      const validation = validateRequiredFields(body, ["forecastId"]);
      if (!validation.valid) {
        return errorResponse(validation.error);
      }

      const updateData: {
        status?: "approved" | "rejected";
        forecast_text?: string;
      } = {};

      if (body.status) {
        updateData.status = body.status;
      }

      if (body.forecast_text !== undefined) {
        updateData.forecast_text = body.forecast_text;
      }

      if (Object.keys(updateData).length === 0) {
        return errorResponse("No update data provided");
      }

      const { error } = await supabase
        .from("token_forecasts")
        .update(updateData)
        .eq("id", body.forecastId);

      if (error) {
        safeLogError(error, `admin-forecasts: update ${body.forecastId}`);
        return errorResponse(error.message || "Failed to update forecast", 500);
      }

      return jsonResponse({
        success: true,
        message: "Forecast updated",
      });
    }

    return errorResponse("Invalid action", 400);
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err;
    }
    safeLogError(err, "admin-forecasts");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(errorMessage, 500);
  }
});

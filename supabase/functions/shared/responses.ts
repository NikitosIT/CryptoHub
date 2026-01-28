import { getCorsHeadersWithJson } from "./cors.ts";

/**
 * Get the Origin header from a request
 */
function getRequestOrigin(reqOrOrigin: Request | string | null): string | null {
  if (reqOrOrigin instanceof Request) {
    return reqOrOrigin.headers.get("Origin");
  }
  return reqOrOrigin ?? null;
}

export function jsonResponse<T>(
  data: T,
  status = 200,
  requestOrOrigin: Request | string | null = null,
): Response {
  const origin = getRequestOrigin(requestOrOrigin);
  return new Response(JSON.stringify(data), {
    status,
    headers: getCorsHeadersWithJson(origin),
  });
}

export function errorResponse(
  message: string,
  status = 400,
  requestOrOrigin: Request | string | null = null,
): Response {
  return jsonResponse({ error: message }, status, requestOrOrigin);
}

export function successResponse<T>(
  data: T,
  status = 200,
  requestOrOrigin: Request | string | null = null,
): Response {
  return jsonResponse({ success: true, ...data }, status, requestOrOrigin);
}

export function unauthorizedResponse(
  message = "Unauthorized",
  requestOrOrigin: Request | string | null = null,
): Response {
  return errorResponse(message, 401, requestOrOrigin);
}

export function notFoundResponse(
  message = "Not found",
  requestOrOrigin: Request | string | null = null,
): Response {
  return errorResponse(message, 404, requestOrOrigin);
}

export function internalErrorResponse(
  message = "Internal server error",
  requestOrOrigin: Request | string | null = null,
): Response {
  return errorResponse(message, 500, requestOrOrigin);
}

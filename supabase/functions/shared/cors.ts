const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");

  if (!allowedOriginsEnv) {
    console.warn(
      "⚠️ ALLOWED_ORIGINS not set. Using permissive CORS (development mode)."
    );
    return requestOrigin || "*";
  }

  if (allowedOriginsEnv === "*") {
    console.warn("⚠️ ALLOWED_ORIGINS is set to '*'. This allows all origins.");
    return "*";
  }

  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((origin) => origin.trim());

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] || "";
};

export function getCorsHeaders(
  requestOrigin: string | null = null
): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(requestOrigin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (allowedOrigin !== "*") {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function getCorsHeadersWithJson(requestOrigin: string | null = null) {
  return {
    ...getCorsHeaders(requestOrigin),
    "Content-Type": "application/json",
  };
}

export function handleOptions(
  reqOrOrigin: Request | string | null = null
): Response {
  const origin =
    reqOrOrigin instanceof Request
      ? reqOrOrigin.headers.get("Origin")
      : reqOrOrigin;

  return new Response("ok", {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const corsHeadersWithJson = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

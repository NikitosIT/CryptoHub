import { safeLogError } from "./logger.ts";

export async function parseRequestBody<T = unknown>(
  req: Request,
): Promise<T> {
  try {
    const bodyText = await req.text();
    if (bodyText && bodyText.trim()) {
      return JSON.parse(bodyText) as T;
    }
  } catch (error) {
    safeLogError(error, "request: parseBody");
    throw new Error("Invalid JSON in request body");
  }
  return {} as T;
}

export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[],
): { valid: true } | { valid: false; error: string } {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    };
  }
  return { valid: true };
}

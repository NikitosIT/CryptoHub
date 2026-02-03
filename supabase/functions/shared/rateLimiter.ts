import { createSupabaseClient, supabase } from "./supabaseApi.ts";
import { errorResponse } from "./responses.ts";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface VerificationRateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
}

export async function checkRateLimit(
  action: string,
  config: RateLimitConfig,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const supabaseClient = createSupabaseClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const userId = user?.id;
  const { data: requests, error } = await supabase
    .from("rate_limits")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", new Date(windowStart).toISOString());

  if (error) {
    console.error("Rate limit check error:", error);
    return false;
  }

  const requestCount = requests?.length || 0;

  if (requestCount >= config.maxRequests) {
    throw errorResponse(
      `Rate limit exceeded: Maximum ${
        config.maxRequests
      } requests per ${Math.floor(config.windowMs / 1000)} seconds`,
      429,
    );
  }

  await supabase.from("rate_limits").insert({
    user_id: userId,
    action,
    created_at: new Date().toISOString(),
  });

  const cleanupThreshold = now - config.windowMs * 2;
  (async () => {
    try {
      await supabase
        .from("rate_limits")
        .delete()
        .lt("created_at", new Date(cleanupThreshold).toISOString());
    } catch (err) {
      console.error("Rate limit cleanup error:", err);
    }
  })();

  return false;
}

export async function checkVerificationRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig,
  isFailedAttempt: boolean,
): Promise<VerificationRateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const maxFailedAttempts = config.maxRequests;

  const failedAction = `${action}_failed`;
  const { data: failedAttempts, error: failedError } = await supabase
    .from("rate_limits")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("action", failedAction)
    .gte("created_at", new Date(windowStart).toISOString())
    .order("created_at", { ascending: false });

  if (failedError) {
    console.error("Rate limit check error:", failedError);
    return { allowed: true, remainingAttempts: maxFailedAttempts };
  }

  const failedCount = failedAttempts?.length || 0;
  const remainingAttempts = Math.max(0, maxFailedAttempts - failedCount);

  if (failedCount >= maxFailedAttempts) {
    const oldestFailed = failedAttempts?.[failedAttempts.length - 1];
    if (oldestFailed?.created_at) {
      const oldestTime = new Date(oldestFailed.created_at).getTime();
      const lockoutExpires = oldestTime + config.windowMs;

      if (now < lockoutExpires) {
        const minutesLeft = Math.ceil((lockoutExpires - now) / 60000);
        throw errorResponse(
          `Too many failed attempts. Please try again in ${minutesLeft} minute${
            minutesLeft !== 1 ? "s" : ""
          }.`,
          429,
        );
      }
    } else {
      throw errorResponse(
        `Too many failed attempts. Please try again in ${Math.ceil(
          config.windowMs / 60000,
        )} minutes.`,
        429,
      );
    }
  }

  if (isFailedAttempt) {
    await supabase.from("rate_limits").insert({
      user_id: userId,
      action: failedAction,
      created_at: new Date().toISOString(),
    });

    const cleanupThreshold = now - config.windowMs * 2;
    (async () => {
      try {
        await supabase
          .from("rate_limits")
          .delete()
          .eq("action", failedAction)
          .lt("created_at", new Date(cleanupThreshold).toISOString());
      } catch (err) {
        console.error("Rate limit cleanup error:", err);
      }
    })();
  }

  return {
    allowed: true,
    remainingAttempts: remainingAttempts - (isFailedAttempt ? 1 : 0),
  };
}

import { safeLogError } from "./logger.ts";

export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0)),
      ),
    );

    return payload;
  } catch (error) {
    safeLogError(error, "jwt: decode");
    return null;
  }
}

export function extractTokenFromHeader(
  authHeader: string | null,
): string | null {
  if (!authHeader) return null;
  return authHeader.replace(/^Bearer\s+/i, "").trim() || null;
}

export function getSessionExpirationFromToken(
  token: string,
): number | null {
  const payload = decodeJWT(token);
  if (!payload || typeof payload.exp !== "number") {
    return null;
  }
  return payload.exp * 1000;
}

export function getSessionIssuedAtFromToken(
  token: string,
): number | null {
  const payload = decodeJWT(token);
  if (!payload || typeof payload.iat !== "number") {
    return null;
  }
  return payload.iat * 1000;
}

export async function getSessionExpiration(
  req: Request,
  supabase: {
    auth: {
      getSession: () => Promise<
        { data: { session: { expires_at?: number } | null } }
      >;
    };
  },
): Promise<number | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const expiration = getSessionExpirationFromToken(token);
      if (expiration) {
        return expiration;
      }
    }
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    return session?.expires_at ? session.expires_at * 1000 : null;
  } catch (error) {
    safeLogError(error, "jwt: getSession");
    return null;
  }
}

export async function getSessionIssuedAt(
  req: Request,
  supabase: {
    auth: {
      getSession: () => Promise<
        { data: { session: { access_token?: string } | null } }
      >;
    };
  },
): Promise<number | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const issuedAt = getSessionIssuedAtFromToken(token);
      if (issuedAt) {
        return issuedAt;
      }
    }
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (session?.access_token) {
      return getSessionIssuedAtFromToken(session.access_token);
    }
  } catch (error) {
    safeLogError(error, "jwt: getSessionIssuedAt");
  }
  return null;
}

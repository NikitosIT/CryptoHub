const ALLOWED_PREFIXES = ["/profile", "/posts", "/auth"] as const;

export function validateRedirectTo(
  redirectTo: string | null | undefined,
  origin = window.location.origin
): string | null {
  if (!redirectTo) return null;

  try {
    const url = new URL(redirectTo, origin);

    if (url.origin !== origin) return null;

    const path = url.pathname;

    const isAllowed =
      path === "/" ||
      ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

    return isAllowed ? path + url.search + url.hash : null;
  } catch {
    return null;
  }
}

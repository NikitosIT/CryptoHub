export function sanitizeText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let sanitized = text.replace(/<[^>]*>/g, "");

  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return sanitized.trim();
}

export function sanitizeNickname(nickname: string | null | undefined): string {
  if (!nickname || typeof nickname !== "string") {
    return "";
  }

  let sanitized = nickname.replace(/<[^>]*>/g, "");

  sanitized = sanitized.replace(/[^\p{L}\p{N}_\s-]/gu, "");

  sanitized = sanitized.trim().replace(/\s+/g, " ");

  return sanitized;
}

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    const dangerousProtocols = [
      "javascript:",
      "data:",
      "vbscript:",
      "file:",
      "about:",
    ];

    if (dangerousProtocols.some((p) => protocol.startsWith(p))) {
      return null;
    }

    if (!protocol.startsWith("http")) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function isTrustedStorageUrl(
  url: string | null | undefined,
  allowedDomains: string[],
): boolean {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    return false;
  }

  try {
    const parsedUrl = new URL(sanitized);
    const hostname = parsedUrl.hostname.toLowerCase();

    return allowedDomains.some((domain) => {
      const domainLower = domain.toLowerCase();
      return hostname === domainLower ||
        hostname.endsWith(`.${domainLower}`);
    });
  } catch {
    return false;
  }
}

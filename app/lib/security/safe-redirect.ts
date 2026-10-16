const DEFAULT_REDIRECT = "/dashboard";

const FORBIDDEN_CHARACTERS =
  /[\u0000-\u001F\u007F\\]/;

export function safeRedirect(
  input: unknown,
  fallback = DEFAULT_REDIRECT
): string {
  if (typeof input !== "string") {
    return fallback;
  }

  const value = input.trim();

  if (
    !value ||
    value.length > 2048 ||
    FORBIDDEN_CHARACTERS.test(value)
  ) {
    return fallback;
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(
      value,
      "https://heybio.invalid"
    );

    if (
      parsed.origin !==
      "https://heybio.invalid"
    ) {
      return fallback;
    }

    if (
      parsed.pathname.startsWith(
        "/api/"
      ) ||
      parsed.pathname === "/logout"
    ) {
      return fallback;
    }

    return (
      parsed.pathname +
      parsed.search +
      parsed.hash
    );
  } catch {
    return fallback;
  }
}

export function getSafeRedirectFromRequest(
  request: Request,
  parameter = "redirectTo"
): string {
  const url = new URL(request.url);

  return safeRedirect(
    url.searchParams.get(parameter)
  );
}
/**
 * Normalize links supplied by creators; never accept script or custom schemes.
 * Callers should render returned URLs as normal external anchors (not fetch them on the server).
 */
export function normalizeExternalUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  if (!value || value.length > 2048 || /[\u0000-\u001F\u007F\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname || url.username || url.password) return null;
    if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) return null;
    return url.href;
  } catch {
    return null;
  }
}

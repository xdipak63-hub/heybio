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
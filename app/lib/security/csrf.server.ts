const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS"
]);

function normalizeOrigin(
  value: string
): string | null {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(
  request: Request
): boolean {
  const expectedOrigin = new URL(
    request.url
  ).origin;

  const suppliedOrigin =
    request.headers.get("Origin");

  if (suppliedOrigin) {
    return (
      normalizeOrigin(suppliedOrigin) ===
      expectedOrigin
    );
  }

  const fetchSite = request.headers.get(
    "Sec-Fetch-Site"
  );

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "none"
  ) {
    return false;
  }

  const referer = request.headers.get(
    "Referer"
  );

  if (!referer) {
    return false;
  }

  return (
    normalizeOrigin(referer) ===
    expectedOrigin
  );
}

export function requireCsrfProtection(
  request: Request
): void {
  if (SAFE_METHODS.has(request.method)) {
    return;
  }

  if (!isSameOriginRequest(request)) {
    throw new Response(
      "Request origin verification failed.",
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export function requireMutationMethod(
  request: Request,
  allowedMethods: readonly string[] = [
    "POST"
  ]
): void {
  if (
    !allowedMethods.includes(
      request.method.toUpperCase()
    )
  ) {
    throw new Response(
      "Method not allowed.",
      {
        status: 405,
        headers: {
          Allow: allowedMethods.join(", "),
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
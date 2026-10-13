export type SecurityHeaderOptions = {
  privateResponse?: boolean;
  allowIndexing?: boolean;
  contentSecurityPolicy?: string;
};

const DEFAULT_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https:",
  "upgrade-insecure-requests"
].join("; ");

export function createSecurityHeaders(
  options: SecurityHeaderOptions = {}
): Headers {
  const headers = new Headers();

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  headers.set(
    "X-Frame-Options",
    "DENY"
  );

  headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()"
    ].join(", ")
  );

  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000"
  );

  headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin"
  );

  headers.set(
    "Content-Security-Policy",
    options.contentSecurityPolicy ??
      DEFAULT_CSP
  );

  if (options.privateResponse) {
    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    headers.set("Vary", "Cookie");
  }

  if (options.allowIndexing === false) {
    headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
  }

  return headers;
}

export function applySecurityHeaders(
  response: Response,
  options: SecurityHeaderOptions = {}
): Response {
  const headers = new Headers(
    response.headers
  );

  const securityHeaders =
    createSecurityHeaders(options);

  securityHeaders.forEach(
    (value, key) => {
      headers.set(key, value);
    }
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function createPrivateJsonResponse(
  payload: unknown,
  status = 200
): Response {
  return Response.json(payload, {
    status,
    headers: createSecurityHeaders({
      privateResponse: true,
      allowIndexing: false
    })
  });
}
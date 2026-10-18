
/**
 * HEYBIO by DIPO LABS
 * Server Security Headers
 *
 * Compatible with the existing React Router
 * application and Razorpay Checkout integration.
 */

export type SecurityHeaderOptions = {
  privateResponse?: boolean;
  allowIndexing?: boolean;
  contentSecurityPolicy?: string;
};

/**
 * Transitional production CSP.
 *
 * unsafe-eval is intentionally disabled.
 * unsafe-inline remains temporarily necessary
 * until the React Router document and checkout
 * scripts are migrated to nonce-based CSP.
 */
const DEFAULT_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://api.razorpay.com",
  "img-src 'self' https: data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  [
    "style-src",
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ].join(" "),
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "https://checkout.razorpay.com",
  ].join(" "),
  [
    "connect-src",
    "'self'",
    "https:",
  ].join(" "),
  [
    "frame-src",
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
  ].join(" "),
  "upgrade-insecure-requests",
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
      "payment=()",
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
    "X-Permitted-Cross-Domain-Policies",
    "none"
  );

  headers.set(
    "X-DNS-Prefetch-Control",
    "off"
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

    headers.set(
      "Vary",
      "Cookie"
    );
  }

  if (options.allowIndexing === false) {
    headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
  }

  return headers;
}

/**
 * Attach security headers to an existing response
 * without discarding its original headers.
 */
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
    headers,
  });
}

/**
 * Return a private JSON response.
 * Suitable for authenticated, non-cacheable APIs.
 */
export function createPrivateJsonResponse(
  payload: unknown,
  status = 200
): Response {
  return Response.json(payload, {
    status,
    headers: createSecurityHeaders({
      privateResponse: true,
      allowIndexing: false,
    }),
  });
}

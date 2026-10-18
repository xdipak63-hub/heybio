
/**
 * HEYBIO by DIPO LABS
 * Cloudflare Worker Entry
 *
 * Security-hardened React Router entrypoint.
 *
 * Preserves:
 * - React Router SSR
 * - Cloudflare environment bindings
 * - Existing API routes
 * - Razorpay and Supabase integrations
 * - Scheduled billing jobs
 */

import {
  createRequestHandler,
  type AppLoadContext,
} from "react-router";

import {
  runBillingJobs,
  type BillingJobBindings,
} from "../app/lib/payments/billing-jobs.server";

import {
  createSecurityHeaders,
} from "../app/lib/security/headers.server";

/**
 * Cloudflare environment bindings.
 *
 * Keep existing billing bindings intact.
 */
export interface HeybioBindings
  extends BillingJobBindings {
  SUPABASE_PUBLISHABLE_KEY?: string;
}

/**
 * Context passed to React Router loaders
 * and actions.
 */
export interface HeybioContext
  extends AppLoadContext {
  cloudflare: {
    env: HeybioBindings;
    ctx: ExecutionContext;
  };
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/admin",
  "/account",
  "/settings",
  "/billing",
  "/api/",
];

const PRIVATE_EXACT_PATHS = new Set([
  "/api",
  "/login",
  "/signup",
  "/logout",
]);

/**
 * Identify routes that should never be
 * stored in shared caches.
 *
 * This is defense in depth, not an
 * authorization mechanism.
 */
function isPrivatePath(
  pathname: string,
): boolean {
  const path =
    pathname.length > 1
      ? pathname.replace(/\/+$/, "")
      : pathname;

  if (PRIVATE_EXACT_PATHS.has(path)) {
    return true;
  }

  return PRIVATE_PREFIXES.some(
    (prefix) =>
      path === prefix.replace(/\/$/, "") ||
      path.startsWith(
        prefix.endsWith("/")
          ? prefix
          : `${prefix}/`,
      ),
  );
}

/**
 * Determine whether the response should
 * be treated as private.
 */
function shouldDisableCaching(
  request: Request,
  response: Response,
): boolean {
  const url = new URL(request.url);

  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    return true;
  }

  if (
    request.headers.has("Authorization") ||
    request.headers.has("Cookie")
  ) {
    return true;
  }

  if (
    response.headers.has("Set-Cookie")
  ) {
    return true;
  }

  if (isPrivatePath(url.pathname)) {
    return true;
  }

  return false;
}

/**
 * Add response security headers while
 * preserving existing route headers.
 */
function secureResponse(
  request: Request,
  response: Response,
): Response {
  const headers = new Headers(
    response.headers,
  );

  const privateResponse =
    shouldDisableCaching(
      request,
      response,
    );

  const securityHeaders =
    createSecurityHeaders({
      privateResponse,
    });

  securityHeaders.forEach(
    (value, key) => {
      if (
        key.toLowerCase() ===
        "strict-transport-security"
      ) {
        if (
          new URL(request.url).protocol ===
          "https:"
        ) {
          headers.set(key, value);
        }

        return;
      }

      if (
        key.toLowerCase() ===
        "content-security-policy" &&
        headers.has(key)
      ) {
        return;
      }

      headers.set(key, value);
    },
  );

  /**
   * Additional browser protection.
   */
  headers.set(
    "X-Permitted-Cross-Domain-Policies",
    "none",
  );

  headers.set(
    "X-DNS-Prefetch-Control",
    "off",
  );

  /**
   * Avoid applying a restrictive CORP
   * globally to publicly shared assets.
   */
  if (privateResponse) {
    headers.set(
      "Cross-Origin-Resource-Policy",
      "same-origin",
    );

    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0",
    );

    headers.delete("ETag");
    headers.delete("Expires");
    headers.delete("Last-Modified");

    const vary = headers.get("Vary");

    if (
      !vary ||
      !vary
        .split(",")
        .some(
          (item) =>
            item.trim().toLowerCase() ===
            "cookie",
        )
    ) {
      headers.set(
        "Vary",
        vary
          ? `${vary}, Cookie`
          : "Cookie",
      );
    }
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

/**
 * Generic unexpected-error response.
 *
 * Never return internal stack traces
 * or secret values to the browser.
 */
function createInternalErrorResponse(
  request: Request,
): Response {
  const headers = createSecurityHeaders({
    privateResponse: true,
    allowIndexing: false,
  });

  headers.set(
    "Content-Type",
    "text/plain; charset=utf-8",
  );

  const response = new Response(
    "An unexpected server error occurred.",
    {
      status: 500,
      headers,
    },
  );

  return secureResponse(
    request,
    response,
  );
}

/**
 * Cloudflare Worker entrypoint.
 */
export default {
  async fetch(
    request: Request,
    env: HeybioBindings,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const context: HeybioContext = {
      cloudflare: {
        env,
        ctx,
      },
    };

    try {
      const response =
        await requestHandler(
          request,
          context,
        );

      return secureResponse(
        request,
        response,
      );
    } catch (error: unknown) {
      /**
       * Do not log complete request headers,
       * cookies, tokens or request bodies.
       */
      console.error(
        "[HEYBIO] Unhandled Worker error",
        {
          method: request.method,
          pathname: new URL(
            request.url,
          ).pathname,
          errorType:
            error instanceof Error
              ? error.name
              : "UnknownError",
        },
      );

      return createInternalErrorResponse(
        request,
      );
    }
  },

  /**
   * Scheduled subscription billing jobs.
   *
   * Existing billing implementation is
   * preserved.
   */
  async scheduled(
    controller: ScheduledController,
    env: HeybioBindings,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runBillingJobs(env)
        .then((result) => {
          console.info(
            "[HEYBIO] Billing scheduled run",
            {
              cron: controller.cron,
              claimed: result.claimed,
              processed: result.processed,
              failed: result.failed,
              enabled: result.enabled,
            },
          );
        })
        .catch((error: unknown) => {
          console.error(
            "[HEYBIO] Billing scheduled run failed",
            {
              cron: controller.cron,
              errorType:
                error instanceof Error
                  ? error.name
                  : "UnknownError",
            },
          );

          throw error;
        }),
    );
  },
};

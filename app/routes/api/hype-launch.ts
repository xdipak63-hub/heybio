
/**
 * HEYBIO by DIPO LABS
 * HYPE DROP launch endpoint
 *
 * Security:
 * - POST only
 * - same-origin CSRF protection
 * - authenticated active account
 * - verified feature entitlement
 * - fail-closed Cloudflare rate limiting
 * - deployment feature flag
 * - no tokens before receiver readiness
 */

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

import {
  requireRateLimit,
} from "../../lib/security/rate-limit.server";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
} as const;

function respond(
  body: Record<string, unknown>,
  status: number,
  sessionHeaders?: Headers,
): Response {
  const headers = new Headers(
    sessionHeaders,
  );

  for (const [key, value] of Object.entries(
    PRIVATE_HEADERS,
  )) {
    headers.set(key, value);
  }

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8",
  );

  return new Response(
    JSON.stringify(body),
    { status, headers },
  );
}

function getEnvironment(
  context: unknown,
): Record<string, unknown> | null {
  if (
    !context ||
    typeof context !== "object" ||
    !("cloudflare" in context)
  ) {
    return null;
  }

  const cloudflare = (
    context as {
      cloudflare?: {
        env?: unknown;
      };
    }
  ).cloudflare;

  const env = cloudflare?.env;

  if (
    !env ||
    typeof env !== "object" ||
    Array.isArray(env)
  ) {
    return null;
  }

  return env as Record<string, unknown>;
}

/**
 * Never issue tokens from GET requests.
 */
export async function loader({
  request,
}: LoaderFunctionArgs) {
  requireMutationMethod(request, ["POST"]);

  return respond(
    { error: "Method not allowed." },
    405,
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const { user, client } =
    await requireUser(request, context);

  const env = getEnvironment(context);

  if (!env) {
    return respond(
      {
        error: "Service temporarily unavailable.",
      },
      503,
      client.headers,
    );
  }

  await requireRateLimit(env, {
    namespace: "hype_launch",
    key: user.id,
    failClosed: true,
  });

  /**
   * Deployment gate.
   *
   * Until the separate HYPE DROP backend
   * supports atomic jti consumption,
   * account linking and session security,
   * no launch token must be issued.
   */
  if (
    env.HYPE_DROP_HANDOFF_ENABLED !==
    "true"
  ) {
    return respond(
      {
        status: "not_ready",
        message:
          "Secure HYPE DROP connection is not available yet.",
      },
      503,
      client.headers,
    );
  }

  /**
   * Verify current eligibility directly
   * against trusted server-side records.
   */
  let entitled = false;

  try {
    const verified =
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "hype_drop",
      );

    entitled =
      verified.allowed === true &&
      verified.billing.active === true &&
      verified.billing.hypeDrop === true &&
      (
        verified.billing.plan ===
          "premium" ||
        verified.billing.plan ===
          "pro_max"
      );
  } catch {
    return respond(
      {
        error:
          "Subscription verification unavailable.",
      },
      503,
      client.headers,
    );
  }

  if (!entitled) {
    return respond(
      {
        error:
          "An active Premium or Pro Max subscription is required.",
      },
      403,
      client.headers,
    );
  }

  /**
   * IMPORTANT:
   * Feature flag alone must not activate
   * a cross-product handoff.
   *
   * Token delivery remains disabled
   * until the separate HYPE DROP receiver
   * and its one-time exchange protocol
   * have been implemented and reviewed.
   */
  return respond(
    {
      status: "receiver_not_integrated",
      message:
        "Your subscription is eligible, but secure HYPE DROP sign-in is not available yet.",
    },
    503,
    client.headers,
  );
}

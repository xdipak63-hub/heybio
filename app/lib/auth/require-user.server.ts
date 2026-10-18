
/**
 * HEYBIO by DIPO LABS
 * Secure User Authentication Guard
 *
 * Security:
 * - Server-side identity verification
 * - Verified email enforcement
 * - Account status enforcement
 * - Missing profile rejection
 * - Fail-closed database handling
 * - Session cookie preservation
 * - Private, non-cacheable responses
 */

import { redirect } from "react-router";
import type { User } from "@supabase/supabase-js";

import {
  createSupabaseServer
} from "../supabase/server";

type ServerClient = ReturnType<
  typeof createSupabaseServer
>;

export type AuthenticatedUser = {
  user: User;
  client: ServerClient;
};

function secureHeaders(
  client: ServerClient
): Headers {
  const headers = new Headers(
    client.headers
  );

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set(
    "Pragma",
    "no-cache"
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow"
  );

  const vary = headers.get("Vary");

  if (
    !vary?.split(",").some(
      value =>
        value.trim().toLowerCase() ===
        "cookie"
    )
  ) {
    headers.set(
      "Vary",
      vary
        ? `${vary}, Cookie`
        : "Cookie"
    );
  }

  return headers;
}

function denyAccess(
  client: ServerClient,
  message: string,
  status: number
): never {
  throw new Response(
    message,
    {
      status,
      headers: secureHeaders(client)
    }
  );
}

/**
 * Require a verified, active user.
 *
 * Never trust client-side user IDs,
 * local storage or frontend state.
 */
export async function requireUser(
  request: Request,
  context: unknown
): Promise<AuthenticatedUser> {
  const client = createSupabaseServer(
    request,
    context
  );

  const headers = secureHeaders(client);

  /**
   * Supabase getUser() verifies the
   * authenticated user server-side.
   */
  const {
    data: { user },
    error: authError
  } = await client.supabase.auth.getUser();

  if (authError || !user) {
    throw redirect(
      "/login",
      {
        headers
      }
    );
  }

  /**
   * Reject unverified email accounts.
   */
  if (
    !user.id ||
    !user.email ||
    !user.email_confirmed_at
  ) {
    throw redirect(
      "/login?verification=required",
      {
        headers: secureHeaders(client)
      }
    );
  }

  /**
   * Read the account status from
   * the database, never from client
   * metadata or request parameters.
   */
  const {
    data: profile,
    error: profileError
  } = await client.supabase
    .from("profiles")
    .select("id, account_status")
    .eq("id", user.id)
    .maybeSingle();

  /**
   * Database failures must not result
   * in authenticated access.
   */
  if (profileError) {
    denyAccess(
      client,
      "Account verification temporarily unavailable.",
      503
    );
  }

  /**
   * Missing profile = no access.
   *
   * Prevents a missing profile from
   * bypassing account-status checks.
   */
  if (
    !profile ||
    profile.id !== user.id
  ) {
    denyAccess(
      client,
      "Account setup is incomplete.",
      403
    );
  }

  /**
   * Only explicitly active accounts
   * may access protected resources.
   */
  if (
    profile.account_status !== "active"
  ) {
    denyAccess(
      client,
      "This account is not currently active.",
      403
    );
  }

  return {
    user,
    client
  };
}

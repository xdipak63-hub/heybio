
/**
 * HEYBIO by DIPO LABS
 * Secure Administrator Authorization
 *
 * Security layers:
 * 1. Verified Supabase user
 * 2. Active account
 * 3. Approved administrator email
 * 4. MFA assurance level AAL2
 * 5. Active database administrator role
 * 6. Explicit permission verification
 *
 * All checks are enforced server-side.
 */

import type { User } from "@supabase/supabase-js";

import {
  requireUser
} from "./require-user.server";

import {
  requireMfa
} from "./require-mfa.server";

import {
  hasVerifiedAdminEmail,
  type AdminPermission,
  requireAdminPermission
} from "../admin/permissions.server";

export type VerifiedAdmin = {
  user: User;
  role: "super_admin";
};

/**
 * Return private headers while preserving
 * Supabase authentication cookie updates.
 */
function adminResponseHeaders(
  source: Headers
): Headers {
  const headers = new Headers(source);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("Vary", "Cookie");
  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );
  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow"
  );

  return headers;
}

/**
 * Reject access without revealing
 * internal role or identity details.
 */
function rejectAdminAccess(
  headers: Headers,
  status: 403 | 503
): never {
  throw new Response(
    status === 503
      ? "Administrator verification unavailable."
      : "Access denied.",
    {
      status,
      headers: adminResponseHeaders(headers)
    }
  );
}

/**
 * Require an authenticated administrator
 * with the requested permission.
 *
 * Never authorize based on:
 * - frontend state
 * - user metadata
 * - request body role
 * - local storage
 * - client-supplied email
 */
export async function requireAdmin(
  request: Request,
  context: unknown,
  permission: AdminPermission =
    "dashboard.read"
): Promise<VerifiedAdmin> {
  /**
   * Step 1:
   * Verify authenticated user and
   * active account status.
   */
  const { user, client } =
    await requireUser(request, context);

  const headers =
    adminResponseHeaders(client.headers);

  /**
   * Step 2:
   * Enforce approved, verified
   * administrator email.
   */
  if (!hasVerifiedAdminEmail(user)) {
    rejectAdminAccess(headers, 403);
  }

  /**
   * Step 3:
   * Enforce MFA AAL2.
   *
   * Keep the existing MFA response
   * recognizable to the admin-page
   * redirect handler.
   */
  try {
    await requireMfa(client.supabase);
  } catch (error) {
    if (error instanceof Response) {
      const responseHeaders =
        adminResponseHeaders(headers);

      error.headers.forEach(
        (value, key) => {
          if (
            key.toLowerCase() ===
            "set-cookie"
          ) {
            responseHeaders.append(
              key,
              value
            );
          }
        }
      );

      throw new Response(
        error.body,
        {
          status: error.status,
          statusText: error.statusText,
          headers: responseHeaders
        }
      );
    }

    rejectAdminAccess(headers, 503);
  }

  /**
   * Step 4:
   * Read administrator role directly
   * from the database.
   *
   * Never use client-controlled
   * user_metadata for authorization.
   */
  let adminRole: {
    user_id: string;
    role: string;
    is_active: boolean;
  } | null = null;

  try {
    const result = await client.supabase
      .from("admin_roles")
      .select(
        "user_id, role, is_active"
      )
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .eq("is_active", true)
      .maybeSingle();

    if (result.error) {
      rejectAdminAccess(headers, 503);
    }

    adminRole = result.data;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    rejectAdminAccess(headers, 503);
  }

  /**
   * Step 5:
   * Fail closed if the active role
   * cannot be verified.
   */
  if (
    !adminRole ||
    adminRole.user_id !== user.id ||
    adminRole.role !== "super_admin" ||
    adminRole.is_active !== true
  ) {
    rejectAdminAccess(headers, 403);
  }

  /**
   * Step 6:
   * Verify the requested permission.
   *
   * Every sensitive admin route must
   * request its specific permission.
   */
  requireAdminPermission(
    "super_admin",
    permission
  );

  return {
    user,
    role: "super_admin"
  };
}

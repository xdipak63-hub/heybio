
import { redirect } from "react-router";

import {
  requireAdmin,
  type VerifiedAdmin
} from "./require-admin.server";

import type {
  AdminPermission
} from "../admin/permissions.server";

export async function requireAdminPage(
  request: Request,
  context: unknown,
  permission: AdminPermission = "dashboard.read"
): Promise<VerifiedAdmin> {
  try {
    return await requireAdmin(
      request,
      context,
      permission
    );
  } catch (error) {
    if (error instanceof Response) {
      // Existing requireUser redirects unauthenticated
      // users to login. Admin pages instead go home.
      const isAuthRedirect =
        error.status >= 300 &&
        error.status < 400;

      const isAccessDenied =
        error.status === 401 ||
        error.status === 403;

      // MFA failures should lead to the verification screen,
      // not silently send an authorized admin to the homepage.
      // Never grant access here: requireAdmin still enforces AAL2.
      const isMfaRequired =
        error.status === 403 &&
        (await error.clone().text()).trim() ===
          "Multi-factor authentication is required.";

      if (isMfaRequired) {
        const headers = new Headers();
        headers.set("Cache-Control", "private, no-store, max-age=0");
        error.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            headers.append(key, value);
          }
        });
        throw redirect("/auth/mfa-verify", { headers });
      }

      if (isAuthRedirect || isAccessDenied) {
        const headers = new Headers();

        headers.set(
          "Cache-Control",
          "private, no-store, max-age=0"
        );

        // Preserve auth session cookie updates,
        // without forwarding an arbitrary Location.
        error.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            headers.append(key, value);
          }
        });

        throw redirect("/", { headers });
      }
    }

    // Do not turn database outages or other
    // infrastructure errors into success redirects.
    throw error;
  }
}

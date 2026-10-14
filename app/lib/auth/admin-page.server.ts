
import { redirect } from "react-router";

import {
  requireAdmin
} from "./require-admin.server";

import type {
  AdminPermission
} from "../admin/permissions.server";

export async function requireAdminPage(
  request: Request,
  context: unknown,
  permission: AdminPermission = "dashboard.read"
) {
  try {
    return await requireAdmin(
      request,
      context,
      permission
    );
  } catch (error) {
    if (
      error instanceof Response &&
      (error.status === 401 ||
        error.status === 403 ||
        error.status === 302)
    ) {
      throw redirect("/", {
        headers: {
          "Cache-Control": "no-store"
        }
      });
    }

    // Infrastructure failures must not
    // silently appear as access denials.
    throw error;
  }
}

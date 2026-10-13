import type {
  User
} from "@supabase/supabase-js";

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

export async function requireAdmin(
  request: Request,
  context: unknown,
  permission: AdminPermission =
    "dashboard.read"
): Promise<VerifiedAdmin> {
  const { user, client } =
    await requireUser(request, context);

  if (!hasVerifiedAdminEmail(user)) {
    throw new Response(
      "Access denied.",
      {
        status: 403,
        headers: client.headers
      }
    );
  }

  await requireMfa(client.supabase);

  const { data: adminRole, error } =
    await client.supabase
      .from("admin_roles")
      .select(
        "user_id, role, is_active"
      )
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .eq("is_active", true)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Administrator verification unavailable.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (
    !adminRole ||
    adminRole.user_id !== user.id ||
    adminRole.role !== "super_admin" ||
    adminRole.is_active !== true
  ) {
    throw new Response(
      "Access denied.",
      {
        status: 403,
        headers: client.headers
      }
    );
  }

  requireAdminPermission(
    "super_admin",
    permission
  );

  return {
    user,
    role: "super_admin"
  };
}
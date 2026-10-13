import type { User } from "@supabase/supabase-js";

export const APPROVED_ADMIN_EMAILS =
  Object.freeze([
    "xdipak63@gmail.com",
    "dipak7rabari@gmail.com"
  ] as const);

export type AdminRole =
  | "super_admin";

export type AdminPermission =
  | "dashboard.read"
  | "users.read"
  | "users.moderate"
  | "users.delete"
  | "subscriptions.read"
  | "payments.read"
  | "payments.refund"
  | "revenue.read"
  | "hype_access.manage"
  | "audit.read"
  | "settings.manage";

const SUPER_ADMIN_PERMISSIONS:
  ReadonlySet<AdminPermission> =
  new Set<AdminPermission>([
    "dashboard.read",
    "users.read",
    "users.moderate",
    "users.delete",
    "subscriptions.read",
    "payments.read",
    "payments.refund",
    "revenue.read",
    "hype_access.manage",
    "audit.read",
    "settings.manage"
  ]);

export function isApprovedAdminEmail(
  email: unknown
): boolean {
  if (typeof email !== "string") {
    return false;
  }

  return APPROVED_ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as
      (typeof APPROVED_ADMIN_EMAILS)[number]
  );
}

export function hasVerifiedAdminEmail(
  user: User
): boolean {
  return Boolean(
    user.id &&
    user.email_confirmed_at &&
    isApprovedAdminEmail(user.email)
  );
}

export function hasAdminPermission(
  role: AdminRole,
  permission: AdminPermission
): boolean {
  if (role !== "super_admin") {
    return false;
  }

  return SUPER_ADMIN_PERMISSIONS.has(
    permission
  );
}

export function requireAdminPermission(
  role: AdminRole,
  permission: AdminPermission
): void {
  if (
    !hasAdminPermission(role, permission)
  ) {
    throw new Response(
      "Permission denied.",
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
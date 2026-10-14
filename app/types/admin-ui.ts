
export type AdminUserStatus =
  | "active"
  | "suspended"
  | "pending"
  | "deleted";

export type AdminSubscriptionStatus =
  | "active"
  | "trialing"
  | "pending"
  | "past_due"
  | "cancelled"
  | "expired";

export interface AdminUserRow {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  status: AdminUserStatus;
  plan: string | null;
  createdAt: string;
}

export interface AdminSubscriptionRow {
  id: string;
  userId: string;
  userEmail: string | null;
  plan: string;
  status: AdminSubscriptionStatus;
  amountPaise: number | null;
  nextBillingAt: string | null;
  createdAt: string;
}

export interface AdminAuditRow {
  id: string;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
}

export interface AdminRevenuePoint {
  label: string;
  amountPaise: number;
}

export interface AdminPagination {
  page: number;
  pageSize: number;
  total: number;
}

export function formatAdminDate(
  value: string | null | undefined
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function formatAdminCurrency(
  amountPaise: number | null | undefined
): string {
  if (
    amountPaise == null ||
    !Number.isFinite(amountPaise)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amountPaise / 100);
}


export const PLAN_IDS = [
  "free",
  "pro",
  "premium",
  "pro_max",
] as const;

export type PlanId =
  (typeof PLAN_IDS)[number];

export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

export type BillingPlan = {
  id: PlanId;
  name: string;
  description: string;
  price_paise: number;
  currency: "INR";
  billing_interval: "monthly" | null;
  tier_rank: number;
  razorpay_plan_id: string | null;
  is_active: boolean;
};

export type SubscriptionRecord = {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  razorpay_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type PaymentResult = {
  verified: boolean;
  subscriptionId: string | null;
  message: string;
};

export function formatINR(
  amountPaise: number,
): string {
  if (
    !Number.isSafeInteger(amountPaise) ||
    amountPaise < 0
  ) {
    throw new RangeError(
      "Invalid amount in paise.",
    );
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amountPaise / 100);
}

export function isPaidPlan(
  planId: PlanId,
): boolean {
  return planId !== "free";
}
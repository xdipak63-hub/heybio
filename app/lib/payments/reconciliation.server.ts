import type {
  SupabaseClient
} from "@supabase/supabase-js";

import {
  createRazorpayClient,
  type RazorpayBindings
} from "./razorpay.server";

export type ReconciliationStatus =
  | "matched"
  | "mismatch"
  | "not_found"
  | "invalid";

export interface ReconciliationResult {
  subscriptionId: string;
  razorpaySubscriptionId: string | null;
  status: ReconciliationStatus;
  localStatus: string | null;
  providerStatus: string | null;
  localPeriodEnd: string | null;
  providerPeriodEnd: string | null;
  checkedAt: string;
}

interface LocalSubscription {
  id: string;
  razorpay_subscription_id: string | null;
  razorpay_plan_id: string | null;
  status: string;
  current_period_end: string | null;
}

function unixToIso(
  seconds: number | null | undefined
): string | null {
  if (
    typeof seconds !== "number" ||
    !Number.isSafeInteger(seconds) ||
    seconds <= 0
  ) {
    return null;
  }

  const milliseconds = seconds * 1000;

  if (
    !Number.isSafeInteger(milliseconds)
  ) {
    return null;
  }

  const date = new Date(milliseconds);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function datesEqual(
  left: string | null,
  right: string | null
): boolean {
  if (left === null || right === null) {
    return left === right;
  }

  const a = Date.parse(left);
  const b = Date.parse(right);

  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    a === b
  );
}

export async function reconcileSubscription(
  db: SupabaseClient,
  env: RazorpayBindings,
  subscriptionId: string
): Promise<ReconciliationResult> {
  const checkedAt = new Date().toISOString();

  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id, razorpay_subscription_id, razorpay_plan_id, status, current_period_end"
    )
    .eq("id", subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Subscription lookup failed."
    );
  }

  const local =
    data as LocalSubscription | null;

  if (!local) {
    return {
      subscriptionId,
      razorpaySubscriptionId: null,
      status: "not_found",
      localStatus: null,
      providerStatus: null,
      localPeriodEnd: null,
      providerPeriodEnd: null,
      checkedAt
    };
  }

  if (!local.razorpay_subscription_id) {
    return {
      subscriptionId,
      razorpaySubscriptionId: null,
      status: "invalid",
      localStatus: local.status,
      providerStatus: null,
      localPeriodEnd:
        local.current_period_end,
      providerPeriodEnd: null,
      checkedAt
    };
  }

  const razorpay = createRazorpayClient(env);

  const provider =
    await razorpay.getSubscription(
      local.razorpay_subscription_id
    );

  const providerPeriodEnd = unixToIso(
    provider.current_end
  );

  const matches =
    provider.id ===
      local.razorpay_subscription_id &&
    provider.plan_id ===
      local.razorpay_plan_id &&
    provider.status === local.status &&
    datesEqual(
      providerPeriodEnd,
      local.current_period_end
    );

  return {
    subscriptionId,
    razorpaySubscriptionId:
      local.razorpay_subscription_id,
    status: matches
      ? "matched"
      : "mismatch",
    localStatus: local.status,
    providerStatus: provider.status,
    localPeriodEnd:
      local.current_period_end,
    providerPeriodEnd,
    checkedAt
  };
}
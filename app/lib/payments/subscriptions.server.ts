import type {
  SupabaseClient
} from "@supabase/supabase-js";

import {
  isPlanId,
  type PlanId
} from "../plans";

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  razorpay_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface BillingAccess {
  plan: PlanId;
  subscriptionId: string | null;
  status: string;
  active: boolean;
  hypeDrop: boolean;
  currentPeriodEnd: string | null;
}

export async function getLatestSubscription(
  db: SupabaseClient,
  userId: string
): Promise<SubscriptionRecord | null> {
  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id,user_id,plan_id,status,razorpay_subscription_id,current_period_start,current_period_end,cancel_at_period_end,created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Unable to read subscription."
    );
  }

  return data as SubscriptionRecord | null;
}

export async function getBillingAccess(
  db: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<BillingAccess> {
  if (
    !userId ||
    Number.isNaN(now.getTime())
  ) {
    throw new Error(
      "Invalid billing access request."
    );
  }

  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id,plan_id,status,current_period_end"
    )
    .eq("user_id", userId)
    .in("status", ["active", "cancelled"])
    .gt(
      "current_period_end",
      now.toISOString()
    )
    .order("current_period_end", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Unable to verify billing access."
    );
  }

  if (
    !data ||
    !isPlanId(data.plan_id) ||
    data.plan_id === "free"
  ) {
    return {
      plan: "free",
      subscriptionId: null,
      status: "free",
      active: false,
      hypeDrop: false,
      currentPeriodEnd: null
    };
  }

  const plan = data.plan_id;

  return {
    plan,
    subscriptionId: data.id,
    status: data.status,
    active: true,
    hypeDrop:
      plan === "premium" ||
      plan === "pro_max",
    currentPeriodEnd:
      data.current_period_end
  };
}
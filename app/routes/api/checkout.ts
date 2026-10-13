import type {
  ActionFunctionArgs
} from "react-router";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod
} from "../../lib/security/csrf.server";

import {
  createSupabaseAdmin,
  getServerBindings
} from "../../lib/supabase/admin.server";

import {
  createRazorpayClient
} from "../../lib/payments/razorpay.server";

import {
  isPlanId,
  requiresPayment
} from "../../lib/plans";

import {
  getBillingAccess
} from "../../lib/payments/subscriptions.server";

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);

  const { user, client } =
    await requireUser(request, context);

  const env = getServerBindings(context);

  const body: unknown = await request.json()
    .catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    !("planId" in body) ||
    !isPlanId(body.planId) ||
    !requiresPayment(body.planId)
  ) {
    return Response.json(
      { error: "Invalid paid plan" },
      { status: 400, headers: client.headers }
    );
  }

  const planId = body.planId;
  const db = createSupabaseAdmin(env);

  const current = await getBillingAccess(
    db,
    user.id
  );

  if (current.active) {
    return Response.json(
      {
        error:
          "An active subscription already exists. Use the plan-change workflow."
      },
      {
        status: 409,
        headers: client.headers
      }
    );
  }

  const { data: existing, error: existingError } =
    await db
      .from("subscriptions")
      .select(
        "id, razorpay_subscription_id, status"
      )
      .eq("user_id", user.id)
      .in("status", [
        "created",
        "authenticated",
        "pending"
      ])
      .order("created_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();

  if (existingError) {
    return Response.json(
      { error: "Billing unavailable" },
      { status: 503 }
    );
  }

  if (existing) {
    return Response.json(
      {
        error:
          "A subscription setup is already in progress.",
        subscriptionId:
          existing.razorpay_subscription_id
      },
      { status: 409 }
    );
  }

  const { data: plan, error: planError } =
    await db
      .from("plans")
      .select(
        "id, razorpay_plan_id, price_paise"
      )
      .eq("id", planId)
      .eq("is_active", true)
      .single();

  if (
    planError ||
    !plan?.razorpay_plan_id
  ) {
    return Response.json(
      {
        error:
          "This plan is not configured for checkout."
      },
      { status: 503 }
    );
  }

  const razorpay = createRazorpayClient({
    RAZORPAY_KEY_ID:
      env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:
      env.RAZORPAY_KEY_SECRET
  });

  // 12 monthly billing cycles. Renewal
  // continuation needs explicit product policy.
  const subscription =
    await razorpay.createSubscription({
      razorpayPlanId:
        plan.razorpay_plan_id,
      totalCount: 12,
      notifyCustomer: true,
      notes: {
        product: "heybio",
        user_id: user.id,
        plan_id: planId
      }
    });

  const { error: saveError } = await db
    .from("subscriptions")
    .insert({
      user_id: user.id,
      plan_id: planId,
      razorpay_subscription_id:
        subscription.id,
      razorpay_plan_id:
        plan.razorpay_plan_id,
      status: "created"
    });

  if (saveError) {
    // Never return checkout success if
    // the local subscription cannot be tracked.
    console.error(
      "Subscription persistence failed:",
      saveError.code
    );

    try {
      await razorpay.cancelSubscription(
        subscription.id,
        false
      );
    } catch {
      console.error(
        "Orphaned Razorpay subscription requires reconciliation."
      );
    }

    return Response.json(
      {
        error:
          "Checkout could not be initialized safely."
      },
      { status: 503 }
    );
  }

  return Response.json(
    {
      subscriptionId: subscription.id,
      razorpayKeyId:
        env.RAZORPAY_KEY_ID,
      planId,
      currency: "INR"
    },
    {
      status: 201,
      headers: client.headers
    }
  );
}
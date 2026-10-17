import type { ActionFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth/require-user.server";
import { requireCsrfProtection, requireMutationMethod } from "../../lib/security/csrf.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";
import { createSupabaseAdmin, getServerBindings } from "../../lib/supabase/admin.server";
import { createRazorpayClient } from "../../lib/payments/razorpay.server";
import { getBillingAccess } from "../../lib/payments/subscriptions.server";
import { checkoutRequestSchema } from "../../lib/validation/billing.schema";
import { PLANS } from "../../lib/plans";

export async function action({ request, context }: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);
  const { user, client } = await requireUser(request, context);
  const env = getServerBindings(context);
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");

  await requireRateLimit(env, { namespace: "checkout", key: user.id });
  const raw = await request.text();
  if (raw.length > 2048) return Response.json({ error: "Invalid request" }, { status: 413, headers });
  const parsed = checkoutRequestSchema.safeParse(
    (() => { try { return JSON.parse(raw) as unknown; } catch { return null; } })()
  );
  if (!parsed.success) return Response.json({ error: "Choose a valid plan and billing mode." }, { status: 400, headers });
  const { planId, mode } = parsed.data;
  const db = createSupabaseAdmin(env);
  const { data: plan, error: planError } = await db.from("plans")
    .select("id,price_paise,razorpay_plan_id")
    .eq("id", planId).eq("is_active", true).maybeSingle();
  if (planError || !plan || plan.price_paise !== PLANS[planId].monthlyPriceInr * 100) {
    return Response.json({ error: "Plan configuration is unavailable." }, { status: 503, headers });
  }
  const access = await getBillingAccess(db, user.id);
  if (access.active) return Response.json({ error: "A paid period is already active. Manage your current plan before purchasing another." }, { status: 409, headers });

  const razorpay = createRazorpayClient(env);
  const { data: pendingAuto, error: pendingAutoError } = await db.from("subscriptions")
    .select("id").eq("user_id", user.id)
    .in("status", ["created", "authenticated", "pending", "halted"])
    .not("razorpay_subscription_id", "is", null).limit(1).maybeSingle();
  if (pendingAutoError) return Response.json({ error: "Billing unavailable" }, { status: 503, headers });
  if (pendingAuto) return Response.json({ error: "An automatic renewal setup is already pending. Check billing before starting another payment." }, { status: 409, headers });
  if (mode === "auto") {
    const { data: manual, error } = await db.from("manual_payment_orders")
      .select("id").eq("user_id", user.id).eq("status", "created")
      .limit(1).maybeSingle();
    if (error) return Response.json({ error: "Billing unavailable" }, { status: 503, headers });
    if (manual) return Response.json({ error: "A manual payment is pending. Complete or resolve it before enabling auto-renewal." }, { status: 409, headers });
  }
  if (mode === "manual") {
    const { data: pending, error } = await db.from("manual_payment_orders")
      .select("id,plan_id,razorpay_order_id,amount_paise,created_at")
      .eq("user_id", user.id).eq("status", "created").maybeSingle();
    if (error) return Response.json({ error: "Billing storage unavailable. Apply migration 028." }, { status: 503, headers });
    if (pending) {
      if (pending.plan_id !== planId) return Response.json({ error: "An unfinished checkout exists for another plan. Contact support if you need it changed." }, { status: 409, headers });
      const previousProviderOrder = await razorpay.getOrder(pending.razorpay_order_id);
      if (previousProviderOrder.status === "paid") return Response.json({
        error: "A previous payment is awaiting verification. Check billing before retrying."
      }, { status: 409, headers });
      // Existing Razorpay order is reused: repeated clicks must never mint new orders.
      return Response.json({ mode, orderId: pending.razorpay_order_id, amountPaise: pending.amount_paise,
        currency: "INR", razorpayKeyId: env.RAZORPAY_KEY_ID, planId }, { headers });
    }
    const order = await razorpay.createOrder({
      amountPaise: plan.price_paise,
      receipt: `hb_${crypto.randomUUID().replaceAll("-", "")}`,
      notes: { product: "heybio", plan_id: planId, user_id: user.id, billing_mode: "manual" }
    });
    if (order.currency !== "INR" || order.amount !== plan.price_paise ||
        !/^order_[A-Za-z0-9]+$/.test(order.id)) {
      return Response.json({ error: "Provider order mismatch" }, { status: 503, headers });
    }
    const { error: saveError } = await db.from("manual_payment_orders").insert({
      user_id: user.id, plan_id: planId, razorpay_order_id: order.id,
      amount_paise: plan.price_paise, status: "created"
    });
    if (saveError) {
      // Never expose an untracked order to checkout.
      console.error("Manual order save failure:", saveError.code);
      return Response.json({ error: "Could not safely create checkout. Check pending payments before retrying." }, { status: 503, headers });
    }
    return Response.json({ mode, orderId: order.id, amountPaise: plan.price_paise,
      razorpayKeyId: env.RAZORPAY_KEY_ID, currency: "INR", planId }, { status: 201, headers });
  }

  if (!plan.razorpay_plan_id) return Response.json({ error: "Auto-renewal is not configured for this plan." }, { status: 503, headers });
  // Verify the merchant's actual Razorpay Plan, not only a mutable DB mapping.
  const providerPlan = await razorpay.getPlan(plan.razorpay_plan_id);
  if (providerPlan.id !== plan.razorpay_plan_id || providerPlan.period !== "monthly" ||
      providerPlan.interval !== 1 || providerPlan.item.currency !== "INR" ||
      providerPlan.item.amount !== plan.price_paise) {
    return Response.json({ error: "Razorpay plan price or billing interval does not match HEYBIO." },
      { status: 503, headers });
  }
  // 12 monthly cycles, displayed to the user explicitly. No permission-free renewals.
  const subscription = await razorpay.createSubscription({
    razorpayPlanId: plan.razorpay_plan_id, totalCount: 12, notifyCustomer: true,
    notes: { product: "heybio", plan_id: planId, user_id: user.id, billing_mode: "auto" }
  });
  if (subscription.plan_id !== plan.razorpay_plan_id) {
    return Response.json({ error: "Provider plan mismatch" }, { status: 503, headers });
  }
  const { error: saveError } = await db.from("subscriptions").insert({
    user_id: user.id, plan_id: planId,
    razorpay_subscription_id: subscription.id, razorpay_plan_id: plan.razorpay_plan_id,
    status: "created"
  });
  if (saveError) {
    console.error("Razorpay subscription save failure:", saveError.code);
    try { await razorpay.cancelSubscription(subscription.id, false); }
    catch { console.error("Orphan subscription requires reconciliation"); }
    return Response.json({ error: "Checkout could not be saved safely" }, { status: 503, headers });
  }
  return Response.json({ mode, subscriptionId: subscription.id,
    razorpayKeyId: env.RAZORPAY_KEY_ID, currency: "INR", planId }, { status: 201, headers });
}

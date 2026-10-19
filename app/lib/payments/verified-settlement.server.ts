import type { SupabaseClient } from "@supabase/supabase-js";
import { createRazorpayClient, type RazorpayBindings, type RazorpayPayment } from "./razorpay.server";
import { parseProviderSubscription, unixSecondsToIso } from "./settlement-types";

const PAY = /^pay_[A-Za-z0-9]+$/;
const SUB = /^sub_[A-Za-z0-9]+$/;
const ORDER = /^order_[A-Za-z0-9]+$/;

/** Run only in Cloudflare Worker with service role, never from browser input alone. */
export async function reconcileProviderSubscription(
  db: SupabaseClient, env: RazorpayBindings, subscriptionId: string
): Promise<string> {
  if (!SUB.test(subscriptionId)) throw new Error("Invalid subscription ID");
  const { data: local, error } = await db.from("subscriptions")
    .select("id,razorpay_plan_id").eq("razorpay_subscription_id", subscriptionId).maybeSingle();
  if (error || !local) throw new Error("Unknown local subscription");
  const provider = parseProviderSubscription(await createRazorpayClient(env).getSubscription(subscriptionId));
  if (provider.id !== subscriptionId || provider.plan_id !== local.razorpay_plan_id) {
    throw new Error("Provider subscription mismatch");
  }
  const { error: settled } = await db.rpc("settle_razorpay_subscription", {
    p_razorpay_subscription_id: provider.id,
    p_razorpay_plan_id: provider.plan_id,
    p_provider_status: provider.status,
    p_period_start: unixSecondsToIso(provider.current_start),
    p_period_end: unixSecondsToIso(provider.current_end)
  });
  if (settled) throw new Error(`Subscription settlement failed: ${settled.code}`);
  return provider.status;
}

export type ReconcilePaymentResult = "activated" | "pending" | "unrelated";

export async function reconcileProviderPayment(
  db: SupabaseClient, env: RazorpayBindings, paymentId: string
): Promise<ReconcilePaymentResult> {
  if (!PAY.test(paymentId)) throw new Error("Invalid payment reference");
  const razorpay = createRazorpayClient(env);
  const payment: RazorpayPayment = await razorpay.getPayment(paymentId);
  if (payment.id !== paymentId || payment.entity !== "payment" || payment.currency !== "INR" ||
      !Number.isSafeInteger(payment.amount) || payment.amount <= 0) {
    throw new Error("Invalid payment from provider");
  }
  if (payment.status !== "captured" || payment.captured !== true) return "pending";

  if (payment.order_id && ORDER.test(payment.order_id)) {
    const { data: order, error } = await db.from("manual_payment_orders")
      .select("razorpay_order_id,amount_paise").eq("razorpay_order_id", payment.order_id).maybeSingle();
    if (error) throw new Error(`Order lookup failed: ${error.code}`);
    if (order) {
      if (payment.subscription_id) throw new Error("Manual payment linked to recurring subscription");
      const providerOrder = await razorpay.getOrder(order.razorpay_order_id);
      if (providerOrder.id !== order.razorpay_order_id || providerOrder.currency !== "INR" ||
          providerOrder.status !== "paid" || providerOrder.amount !== order.amount_paise ||
          providerOrder.amount_paid !== order.amount_paise || payment.amount !== order.amount_paise) {
        throw new Error("Captured order verification mismatch");
      }
      const { error: settlementError } = await db.rpc("settle_verified_manual_order", {
        p_order_id: order.razorpay_order_id, p_payment_id: payment.id,
        p_amount_paise: payment.amount, p_currency: payment.currency,
        p_payment_status: payment.status, p_payment_method: payment.method ?? null
      });
      if (settlementError) throw new Error(`Manual settlement failed: ${settlementError.code}`);
      return "activated";
    }
  }

  if (payment.subscription_id && SUB.test(payment.subscription_id)) {
    const { data: subscription, error } = await db.from("subscriptions")
      .select("id,plan_id,razorpay_subscription_id")
      .eq("razorpay_subscription_id", payment.subscription_id).maybeSingle();
    if (error) throw new Error(`Subscription payment lookup failed: ${error.code}`);
    if (!subscription) return "unrelated";
    // Razorpay may charge a nominal authentication amount before the first bill.
    // Never store it as a full monthly fee or use it alone to activate access.
    const { data: plan, error: planError } = await db.from("plans")
      .select("price_paise").eq("id", subscription.plan_id).single();
    if (planError || !plan) throw new Error("Subscription pricing missing");
    const providerStatus = await reconcileProviderSubscription(db, env, payment.subscription_id);
    if (payment.amount === plan.price_paise) {
      const { error: recordError } = await db.rpc("record_verified_recurring_payment", {
        p_subscription_id: payment.subscription_id, p_payment_id: payment.id,
        p_order_id: payment.order_id ?? null, p_amount_paise: payment.amount,
        p_currency: payment.currency, p_payment_status: payment.status,
        p_payment_method: payment.method ?? null
      });
      if (recordError) throw new Error(`Payment recording failed: ${recordError.code}`);
    }
    return providerStatus === "active" ? "activated" : "pending";
  }
  return "unrelated";
}


/** Reads the refund state from Razorpay and applies it. Webhook JSON is never trusted for amounts. */
export async function reconcileProviderRefund(
  db: SupabaseClient, env: RazorpayBindings, paymentId: string
): Promise<boolean> {
  if (!PAY.test(paymentId)) throw new Error("Invalid payment reference");
  const payment: RazorpayPayment = await createRazorpayClient(env).getPayment(paymentId);
  if (payment.id !== paymentId || payment.entity !== "payment" || payment.currency !== "INR" ||
      !Number.isSafeInteger(payment.amount) || payment.amount <= 0) {
    throw new Error("Invalid payment from provider");
  }
  const refunded = payment.amount_refunded ?? 0;
  if (!Number.isSafeInteger(refunded) || refunded < 0 || refunded > payment.amount) {
    throw new Error("Invalid refund amount from provider");
  }
  if (refunded === 0) return false;
  const status = payment.status === "refunded" ? "refunded" : "captured";
  const { data, error } = await db.rpc("apply_verified_refund", {
    p_payment_id: payment.id, p_amount_refunded_paise: refunded, p_provider_status: status
  });
  if (error) throw new Error(`Refund settlement failed: ${error.code}`);
  return (data as { applied?: boolean } | null)?.applied === true;
}

import type { ActionFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth/require-user.server";
import { requireMutationMethod, requireCsrfProtection } from "../../lib/security/csrf.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";
import { getServerBindings, createSupabaseAdmin } from "../../lib/supabase/admin.server";
import { checkoutVerificationSchema } from "../../lib/validation/billing.schema";
import { verifyOrderCheckoutSignature, verifySubscriptionCheckoutSignature } from "../../lib/payments/verify-signature.server";
import { reconcileProviderPayment, reconcileProviderSubscription } from "../../lib/payments/verified-settlement.server";

export async function action({ request, context }: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);
  const { user, client } = await requireUser(request, context);
  const env = getServerBindings(context);
  await requireRateLimit(env, { namespace: "payment-verify", key: user.id });
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");
  const raw = await request.text();
  if (raw.length > 4096) return Response.json({ error: "Request too large" }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = checkoutVerificationSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid verification request" }, { status: 400, headers });
  const input = parsed.data;
  const db = createSupabaseAdmin(env);
  try {
    if (input.mode === "manual") {
      if (!input.razorpay_order_id || input.razorpay_subscription_id) {
        return Response.json({ error: "Invalid manual payment" }, { status: 400, headers });
      }
      const { data: order, error } = await db.from("manual_payment_orders")
        .select("razorpay_order_id").eq("user_id", user.id)
        .eq("razorpay_order_id", input.razorpay_order_id).maybeSingle();
      if (error || !order) return Response.json({ error: "Order not found" }, { status: 404, headers });
      const valid = await verifyOrderCheckoutSignature({
        razorpayOrderId: order.razorpay_order_id, razorpayPaymentId: input.razorpay_payment_id,
        razorpaySignature: input.razorpay_signature, secret: env.RAZORPAY_KEY_SECRET
      });
      if (!valid) return Response.json({ error: "Invalid checkout signature" }, { status: 401, headers });
    } else {
      if (!input.razorpay_subscription_id || input.razorpay_order_id) {
        return Response.json({ error: "Invalid automatic-renewal payment" }, { status: 400, headers });
      }
      const { data: subscription, error } = await db.from("subscriptions")
        .select("razorpay_subscription_id").eq("user_id", user.id)
        .eq("razorpay_subscription_id", input.razorpay_subscription_id).maybeSingle();
      if (error || !subscription) return Response.json({ error: "Subscription not found" }, { status: 404, headers });
      const valid = await verifySubscriptionCheckoutSignature({
        razorpaySubscriptionId: subscription.razorpay_subscription_id,
        razorpayPaymentId: input.razorpay_payment_id,
        razorpaySignature: input.razorpay_signature, secret: env.RAZORPAY_KEY_SECRET
      });
      if (!valid) return Response.json({ error: "Invalid checkout signature" }, { status: 401, headers });
    }
    const result = await reconcileProviderPayment(db, env, input.razorpay_payment_id);
    if (result === "unrelated") return Response.json({ error: "Payment does not belong to the checkout" }, { status: 409, headers });
    if (input.mode === "auto" && input.razorpay_subscription_id) {
      await reconcileProviderSubscription(db, env, input.razorpay_subscription_id);
    }
    return Response.json({ ok: true, status: result === "activated" ? "verified" : "pending" }, { headers });
  } catch (error) {
    console.error("Payment verification requires reconciliation", error instanceof Error ? error.message : "unknown");
    return Response.json({ ok: false, status: "pending", message: "Verification is still pending. Check billing before retrying." }, { status: 202, headers });
  }
}

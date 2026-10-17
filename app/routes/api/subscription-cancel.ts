import type { ActionFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth/require-user.server";
import { requireCsrfProtection, requireMutationMethod } from "../../lib/security/csrf.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";
import { createSupabaseAdmin, getServerBindings } from "../../lib/supabase/admin.server";
import { createRazorpayClient } from "../../lib/payments/razorpay.server";
import { getBillingAccess } from "../../lib/payments/subscriptions.server";

/** User-requested end-of-cycle cancellation; no plan activation or refund. */
export async function action({ request, context }: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);
  const { user, client } = await requireUser(request, context);
  const env = getServerBindings(context);
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  await requireRateLimit(env, { namespace: "billing-cancel", key: user.id });

  const db = createSupabaseAdmin(env);
  const access = await getBillingAccess(db, user.id);
  const { data: target, error } = await db.from("subscriptions")
    .select("id,status,current_period_end,razorpay_subscription_id,cancel_at_period_end")
    .eq("user_id", user.id)
    .not("razorpay_subscription_id", "is", null)
    .in("status", ["active", "authenticated", "pending", "halted", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();

  if (error) return Response.json({ error: "Billing status unavailable." }, { status: 503, headers });
  if (!target?.razorpay_subscription_id) return Response.json({ error: "No recurring mandate found to cancel." }, { status: 404, headers });
  const paidPeriod = Boolean(
    access.active && access.subscriptionId === target.id &&
    target.current_period_end && new Date(target.current_period_end).getTime() > Date.now()
  );

  // Already scheduled: idempotent, never cancel a provider mandate twice.
  if (target.cancel_at_period_end || target.status === "cancelled") {
    return Response.json({ ok: true, alreadyScheduled: true, cancelAtCycleEnd: paidPeriod, providerStatus: target.status }, { headers });
  }

  const razorpay = createRazorpayClient(env);
  let provider: Awaited<ReturnType<typeof razorpay.getSubscription>>;
  try {
    provider = await razorpay.getSubscription(target.razorpay_subscription_id);
  } catch {
    return Response.json({ error: "Razorpay status could not be confirmed. Check billing and contact support before retrying." }, { status: 503, headers });
  }
  if (provider.id !== target.razorpay_subscription_id) {
    return Response.json({ error: "Provider subscription mismatch." }, { status: 503, headers });
  }
  if (["completed", "expired", "cancelled"].includes(provider.status)) {
    // Another device or webhook may have already canceled. Avoid a second POST.
    const { error: syncError } = await db.from("subscriptions")
      .update({ cancel_at_period_end: paidPeriod, cancelled_at: new Date().toISOString() })
      .eq("user_id", user.id).eq("id", target.id);
    if (syncError) return Response.json({ error: "Provider state could not be synchronized. Contact support." }, { status: 503, headers });
    return Response.json({ ok: true, providerStatus: provider.status, cancelAtCycleEnd: paidPeriod }, { headers });
  }

  if (!["active", "authenticated", "pending", "halted", "created"].includes(provider.status)) {
    return Response.json({ error: "Provider status needs reconciliation before cancellation." }, { status: 409, headers });
  }
  let result: Awaited<ReturnType<typeof razorpay.cancelSubscription>>;
  try {
    result = await razorpay.cancelSubscription(target.razorpay_subscription_id, paidPeriod);
  } catch {
    return Response.json({ error: "Cancellation result is not yet confirmed. Do not start another payment; check your Razorpay mandate and contact support." }, { status: 503, headers });
  }
  if (result.id !== target.razorpay_subscription_id) {
    return Response.json({ error: "Razorpay cancellation response mismatch." }, { status: 503, headers });
  }
  const { error: saveError } = await db.from("subscriptions").update({
    cancel_at_period_end: paidPeriod,
    cancelled_at: paidPeriod ? null : new Date().toISOString(),
  }).eq("id", target.id).eq("user_id", user.id);
  if (saveError) {
    console.error("Provider cancellation accepted, local sync pending", saveError.code);
    return Response.json({ error: "Razorpay accepted the cancellation but status synchronization is pending. Contact support; do not retry payment." }, { status: 503, headers });
  }
  return Response.json({ ok: true, cancelAtCycleEnd: paidPeriod, providerStatus: result.status }, { headers });
}

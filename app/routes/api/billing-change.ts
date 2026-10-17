import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { requireUser } from "../../lib/auth/require-user.server";
import { requireCsrfProtection, requireMutationMethod } from "../../lib/security/csrf.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";
import { createSupabaseAdmin, getServerBindings } from "../../lib/supabase/admin.server";
import { getBillingAccess } from "../../lib/payments/subscriptions.server";
import { createRazorpayClient } from "../../lib/payments/razorpay.server";

const requestSchema = z.object({
  planId: z.enum(["free", "pro", "premium", "pro_max"]),
  mode: z.enum(["manual", "auto"]),
  confirmCancellation: z.boolean().optional(),
}).strict().refine(input => input.planId !== "free" || input.mode === "manual");

/**
 * Records the user's next-period preference only. Does NOT activate a plan,
 * start a payment, authorize a mandate, or create an entitlement.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);
  const { user, client } = await requireUser(request, context);
  const env = getServerBindings(context);
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  await requireRateLimit(env, { namespace: "billing-change", key: user.id });

  const content = await request.text();
  if (content.length > 1024) return Response.json({ error: "Request too large" }, { status: 413, headers });
  let json: unknown = null;
  try { json = JSON.parse(content); } catch { /* invalid */ }
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Select a valid next plan and billing method." }, { status: 400, headers });

  const db = createSupabaseAdmin(env);
  const access = await getBillingAccess(db, user.id);
  if (!access.active || !access.subscriptionId || !access.currentPeriodEnd) {
    return Response.json({ error: "No active paid period. Choose your next plan directly at checkout." }, { status: 409, headers });
  }

  const { data: subscription, error: subError } = await db.from("subscriptions")
    .select("id,status,plan_id,current_period_end,razorpay_subscription_id,cancel_at_period_end")
    .eq("id", access.subscriptionId).eq("user_id", user.id).maybeSingle();
  if (subError || !subscription || !["active", "cancelled"].includes(subscription.status) ||
      subscription.plan_id !== access.plan || subscription.current_period_end !== access.currentPeriodEnd) {
    return Response.json({ error: "Billing state changed. Refresh and try again." }, { status: 409, headers });
  }

  // A second setup in progress must be resolved before modifying renewals.
  const { data: otherSetup, error: setupError } = await db.from("subscriptions")
    .select("id").eq("user_id", user.id)
    .in("status", ["created", "authenticated", "pending", "halted"])
    .not("razorpay_subscription_id", "is", null)
    .neq("id", subscription.id).limit(1).maybeSingle();
  if (setupError) return Response.json({ error: "Billing state unavailable." }, { status: 503, headers });
  if (otherSetup) return Response.json({ error: "Resolve the pending renewal setup before selecting a new plan." }, { status: 409, headers });

  const isAuto = Boolean(subscription.razorpay_subscription_id);
  if (isAuto && !subscription.cancel_at_period_end) {
    if (parsed.data.confirmCancellation !== true) {
      return Response.json({ error: "Explicit confirmation is required before cancelling auto-renewal." }, { status: 400, headers });
    }
    const clientApi = createRazorpayClient(env);
    let provider: Awaited<ReturnType<typeof clientApi.getSubscription>>;
    try {
      provider = await clientApi.getSubscription(subscription.razorpay_subscription_id);
    } catch {
      return Response.json({ error: "Unable to confirm Razorpay mandate. No preference was saved. Check billing or contact support before retrying." }, { status: 503, headers });
    }
    if (provider.id !== subscription.razorpay_subscription_id || !["active", "cancelled"].includes(provider.status)) {
      return Response.json({ error: "Current mandate status could not be confirmed. No preference saved." }, { status: 409, headers });
    }
    if (provider.status !== "cancelled") {
      let cancellation: Awaited<ReturnType<typeof clientApi.cancelSubscription>>;
      try {
        cancellation = await clientApi.cancelSubscription(subscription.razorpay_subscription_id, true);
      } catch {
        return Response.json({ error: "Razorpay cancellation could not be confirmed. Check your mandate status and contact support before retrying." }, { status: 503, headers });
      }
      if (cancellation.id !== subscription.razorpay_subscription_id) {
        return Response.json({ error: "Razorpay cancellation confirmation mismatch." }, { status: 503, headers });
      }
    }
    const { error: cancelSyncError } = await db.from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", subscription.id).eq("user_id", user.id);
    if (cancelSyncError) {
      return Response.json({ error: "Provider cancellation was requested but local sync is pending. Contact support before retrying." }, { status: 503, headers });
    }
  }

  // A newer paid subscription must not inherit a preference from an old one.
  const confirmed = await getBillingAccess(db, user.id);
  if (confirmed.subscriptionId !== subscription.id || confirmed.currentPeriodEnd !== access.currentPeriodEnd) {
    return Response.json({ error: "Paid period changed while saving. Refresh billing; no new payment was created." }, { status: 409, headers });
  }

  const { error: saveError } = await db.from("billing_change_preferences").upsert({
    user_id: user.id,
    from_subscription_id: subscription.id,
    target_plan_id: parsed.data.planId,
    target_mode: parsed.data.mode,
    available_after: access.currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (saveError) {
    console.error("Billing preference could not be stored:", saveError.code);
    return Response.json({ error: "Preference not saved. If auto-renew was cancelled, your paid access remains through its verified period. Contact support before retrying." }, { status: 503, headers });
  }
  return Response.json({ ok: true, nextCheckoutAfter: access.currentPeriodEnd, charged: false }, { status: 200, headers });
}

import { Link, data, useLoaderData, useRevalidator } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ArrowLeft, CreditCard, History, Info, RefreshCw } from "lucide-react";
import SubscriptionStatus from "../../components/billing/SubscriptionStatus";
import CancelSubscription from "../../components/billing/CancelSubscription";
import PlanSwitch, { type ChangePreference } from "../../components/billing/PlanSwitch";
import CheckoutButton from "../../components/billing/CheckoutButton";
import { requireUser } from "../../lib/auth/require-user.server";
import { createSupabaseAdmin, getServerBindings } from "../../lib/supabase/admin.server";
import { getLatestSubscription } from "../../lib/payments/subscriptions.server";
import { getVerifiedFeatureAccess } from "../../lib/creator/access.server";
import { isPlanId } from "../../lib/plans";
import "../../styles/billing.css";

export const meta: MetaFunction = () => [
  { title: "Billing — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  try {
    const db = createSupabaseAdmin(getServerBindings(context));
    const [latest, verified] = await Promise.all([
      getLatestSubscription(db, user.id),
      getVerifiedFeatureAccess(context, client.supabase, user.id, "hype_drop"),
    ]);
    const { billing } = verified;

    // The newest subscription is not necessarily the user's active one.
    const { data: activeRecord, error: activeError } = billing.subscriptionId
      ? await db.from("subscriptions")
          .select("id,plan_id,status,razorpay_subscription_id,cancel_at_period_end,current_period_end")
          .eq("user_id", user.id).eq("id", billing.subscriptionId).maybeSingle()
      : { data: null, error: null };
    if (activeError || (billing.active && !activeRecord)) throw new Error("Active subscription lookup failed");

    const { data: preferenceRow, error: prefError } = await db.from("billing_change_preferences")
      .select("from_subscription_id,target_plan_id,target_mode,available_after")
      .eq("user_id", user.id).maybeSingle();
    if (prefError) throw new Error("Billing preferences unavailable (migration 030 required)");

    const associatedId = billing.subscriptionId ?? latest?.id ?? null;
    const preference: ChangePreference | null = preferenceRow &&
      preferenceRow.from_subscription_id === associatedId &&
      isPlanId(preferenceRow.target_plan_id) &&
      (preferenceRow.target_mode === "manual" || preferenceRow.target_mode === "auto")
        ? { target_plan_id: preferenceRow.target_plan_id,
            target_mode: preferenceRow.target_mode,
            available_after: preferenceRow.available_after }
        : null;

    const auto = Boolean(activeRecord?.razorpay_subscription_id);
    const currentMode = auto ? "auto" : "manual";
    const scheduledCancellation = Boolean(activeRecord?.cancel_at_period_end);
    const canCancel = Boolean(auto && billing.active && activeRecord?.status === "active" && !scheduledCancellation);

    return data({
      plan: billing.plan,
      active: billing.active,
      status: billing.active ? billing.status : (latest?.status ?? "free"),
      currentPeriodEnd: billing.currentPeriodEnd,
      cancelAtPeriodEnd: scheduledCancellation,
      hypeDrop: verified.allowed,
      currentMode,
      canCancel,
      preference,
      latestPlan: latest?.plan_id ?? null,
      latestCreatedAt: latest?.created_at ?? null,
    }, { headers });
  } catch (cause) {
    console.error("Billing page unavailable:", cause instanceof Error ? cause.message : "unknown");
    throw new Response("Billing is temporarily unavailable. No charge was initiated.", { status: 503, headers });
  }
}

function displayDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
}

export default function BillingPage() {
  const details = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const busy = revalidator.state === "loading";

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link to="/dashboard" className="hb-workspace__back"><ArrowLeft size={17} aria-hidden="true" /> Dashboard</Link>
        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">YOUR MEMBERSHIP</span>
            <h1><CreditCard size={29} aria-hidden="true" /> Billing</h1>
            <p>Secure payment history, verified membership and next-period preferences.</p>
          </div>
        </header>
        <SubscriptionStatus
          plan={details.plan} status={details.status} active={details.active}
          currentPeriodEnd={details.currentPeriodEnd}
          cancelAtPeriodEnd={details.cancelAtPeriodEnd}
          hypeDrop={details.hypeDrop} loading={busy}
          renewalMode={details.active ? details.currentMode : null}
        />
        <section className="hb-billing-manage" aria-labelledby="hb-billing-manage-title">
          <div className="hb-billing-manage__heading">
            <h2 id="hb-billing-manage-title">Manage your membership</h2>
            <button type="button" className="hb-billing-text-button" onClick={() => revalidator.revalidate()} disabled={busy}>
              <RefreshCw size={15} aria-hidden="true" /> {busy ? "Checking…" : "Refresh status"}
            </button>
          </div>
          {details.active ? (
            <>
              <p>
                Your {details.currentMode === "auto" ? "authorized automatic renewal" : "manual monthly payment"} is active.
                {details.currentMode === "manual" ? " Nothing will be debited automatically." : " Razorpay handles renewals under your authorized mandate."}
              </p>
              {details.cancelAtPeriodEnd && details.currentMode === "auto" && (
                <p className="hb-change-plan__saved" role="status">Your existing auto-renewal cancellation is scheduled. Your verified paid access can continue until {displayDate(details.currentPeriodEnd)}. Future renewal requires a new checkout.</p>
              )}
              {details.currentPeriodEnd && (
                <PlanSwitch
                  currentPlan={details.plan}
                  currentMode={details.currentMode}
                  currentPeriodEnd={details.currentPeriodEnd}
                  preference={details.preference}
                  cancelExistingAuto={details.currentMode === "auto" && !details.cancelAtPeriodEnd}
                  onChanged={() => revalidator.revalidate()}
                />
              )}
              {details.canCancel && (
                <div className="hb-billing-cancel-wrap">
                  <h3>Stop automatic renewal</h3>
                  <p>Cancel future Razorpay charges without initiating another payment. Current-period access is based on provider verification.</p>
                  <CancelSubscription onCancelled={() => revalidator.revalidate()} />
                </div>
              )}
            </>
          ) : (
            <>
              {details.latestPlan && (
                <div className="hb-workspace__note" role="note">
                  <Info size={18} aria-hidden="true" />
                  <span>Previous plan: {details.latestPlan.replaceAll("_", " ")}. Status: {details.status}. Paid features require a current verified period.</span>
                </div>
              )}
              {details.preference ? (
                <div className="hb-billing-next-checkout">
                  <h3>Complete your chosen next plan</h3>
                  <p>
                    Your preferred plan is <strong>{details.preference.target_plan_id.replaceAll("_", " ")}</strong>.
                    {details.preference.target_plan_id === "free"
                      ? " No payment is required: your account remains on Free unless you purchase another plan."
                      : ` A new ${details.preference.target_mode === "auto" ? "Razorpay recurring authorization" : "manual Razorpay payment"} is required; no charge happened when you saved the preference.`}
                  </p>
                  {details.preference.target_plan_id !== "free" && (
                    <CheckoutButton
                      planId={details.preference.target_plan_id}
                      initialMode={details.preference.target_mode}
                      onVerificationPending={() => revalidator.revalidate()}
                    />
                  )}
                </div>
              ) : (
                <p>No active paid membership. You may choose a paid plan when you're ready.</p>
              )}
            </>
          )}
          <div className="hb-workspace__actions" style={{ marginTop: 22 }}>
            <Link className="hb-workspace__button hb-workspace__button--primary" to="/pricing">Compare plans</Link>
            <Link className="hb-workspace__button" to="/dashboard/payment-history">
              <History size={17} aria-hidden="true" /> Payment history
            </Link>
          </div>
        </section>
        <p className="hb-workspace__fine" style={{ marginTop: 18 }}>
          Payments activate plans only after Razorpay and server-side verification. Payment history is not a tax invoice. Billing support: <a href="mailto:dipolabs123@gmail.com">dipolabs123@gmail.com</a>. Never share OTPs or passwords.
        </p>
      </div>
    </main>
  );
}

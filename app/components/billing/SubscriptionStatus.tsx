
import { CalendarDays, CheckCircle2, Clock3, LockKeyhole } from "lucide-react";
import {
  PLANS,
  isPlanId,
  type PlanId
} from "../../lib/plans";

type Props = {
  plan: PlanId;
  status: string;
  active: boolean;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  hypeDrop: boolean;
  loading?: boolean;
  renewalMode?: "manual" | "auto" | null;
};

function dateLabel(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function SubscriptionStatus({
  plan,
  status,
  active,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
  hypeDrop,
  loading = false,
  renewalMode = null
}: Props) {
  const safePlan = isPlanId(plan) ? plan : "free";
  const verifiedPaid = active && safePlan !== "free";
  const verifiedHype = verifiedPaid && hypeDrop &&
    (safePlan === "premium" || safePlan === "pro_max");

  return (
    <section className="hb-subscription-status" aria-label="Subscription status" aria-busy={loading}>
      <div className="hb-subscription-status__header">
        <div>
          <span className="hb-billing-eyebrow">YOUR MEMBERSHIP</span>
          <h2>{PLANS[safePlan].name}</h2>
        </div>
        <span className={`hb-subscription-status__pill ${verifiedPaid ? "is-active" : ""}`}>
          {verifiedPaid ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
          {loading ? "Checking" : verifiedPaid ? "Active" : safePlan === "free" ? "Free plan" : "Not active"}
        </span>
      </div>

      <div className="hb-subscription-status__details">
        <div>
          <span>Billing status</span>
          <strong>{loading ? "Checking…" : status.replaceAll("_", " ")}</strong>
        </div>
        <div>
          <span>{cancelAtPeriodEnd ? "Access ends" : "Current period ends"}</span>
          <strong>
            <CalendarDays size={15} aria-hidden="true" />
            {dateLabel(currentPeriodEnd)}
          </strong>
        </div>
        {verifiedPaid && (<div>
          <span>Renewal method</span>
          <strong>{renewalMode === "auto" ? "Authorized auto-renewal" : "Manual monthly payment"}</strong>
        </div>)}
        <div>
          <span>HYPE DROP</span>
          <strong>
            {verifiedHype ? <CheckCircle2 size={15} /> : <LockKeyhole size={15} />}
            {verifiedHype ? "Available" : "Locked"}
          </strong>
        </div>
      </div>

      {cancelAtPeriodEnd && verifiedPaid && (
        <p className="hb-subscription-status__notice">
          Cancellation has been scheduled. Your access is subject to the verified billing period.
        </p>
      )}
    </section>
  );
}

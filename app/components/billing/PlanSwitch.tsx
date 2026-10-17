import { useRef, useState } from "react";
import { ArrowRightLeft, LoaderCircle } from "lucide-react";
import { PLANS, type PlanId } from "../../lib/plans";

export type ChangePreference = {
  target_plan_id: PlanId;
  target_mode: "manual" | "auto";
  available_after: string;
};

type Props = {
  currentPlan: PlanId;
  currentMode: "manual" | "auto";
  currentPeriodEnd: string;
  preference: ChangePreference | null;
  cancelExistingAuto: boolean;
  onChanged: () => void;
};

function humanDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "the current billing period ends";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
}

export default function PlanSwitch({
  currentPlan, currentMode, currentPeriodEnd, preference, cancelExistingAuto, onChanged,
}: Props) {
  const [planId, setPlanId] = useState<PlanId>(preference?.target_plan_id ?? currentPlan);
  const [mode, setMode] = useState<"manual" | "auto">(preference?.target_mode ?? currentMode);
  const [busy, setBusy] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const busyRef = useRef(false);

  async function scheduleChange() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/billing-change", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ planId, mode: planId === "free" ? "manual" : mode,
          confirmCancellation: cancelExistingAuto && acknowledged }),
      });
      const json = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Unable to save your renewal preference.");
      }
      setSuccess("Preference saved. No new charge was made. Your existing access remains subject to the verified paid period.");
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save preference.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="hb-change-plan" aria-labelledby="hb-change-plan-heading">
      <div className="hb-change-plan__header">
        <ArrowRightLeft size={20} aria-hidden="true" />
        <h3 id="hb-change-plan-heading">Change plan at period end</h3>
      </div>
      <p>
        Your current {PLANS[currentPlan].name} membership remains valid through {humanDate(currentPeriodEnd)}.
        A different plan or billing method requires a new checkout after this period ends.
        <strong> We will not charge or switch plans automatically based on this preference.</strong>
      </p>
      {cancelExistingAuto && (
        <p className="hb-change-plan__alert">
          Saving this preference will request cancellation of future renewals for your current Razorpay mandate.
          To enable auto-renewal on the next plan you must authorize a new mandate at checkout.
        </p>
      )}
      {preference && (
        <p className="hb-change-plan__saved" role="status">
          Saved next choice: <strong>{PLANS[preference.target_plan_id].name}</strong>
          {preference.target_plan_id === "free" ? " (no charge)" : ` · ${preference.target_mode === "auto" ? "Auto-renew" : "Pay manually"}`}.
          Checkout becomes available when the current paid period ends.
        </p>
      )}
      <div className="hb-change-plan__fields">
        <label>
          Next plan
          <select value={planId} onChange={(e) => {
            const selected = e.currentTarget.value as PlanId;
            setPlanId(selected);
            if (selected === "free") setMode("manual");
          }} disabled={busy}>
            <option value="free">Free — ₹0</option>
            <option value="pro">Pro — ₹149/month</option>
            <option value="premium">Premium — ₹249/month</option>
            <option value="pro_max">Pro Max — ₹499/month</option>
          </select>
        </label>
        <label>
          Next billing method
          <select value={planId === "free" ? "manual" : mode} onChange={(e) => setMode(e.currentTarget.value as "manual" | "auto")} disabled={busy || planId === "free"}>
            <option value="manual">Manual monthly payment</option>
            <option value="auto">Authorized monthly auto-renew</option>
          </select>
        </label>
      </div>
      {cancelExistingAuto && (
        <label className="hb-change-plan__confirm">
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.currentTarget.checked)} disabled={busy} />
          <span>I authorize cancellation of my current future auto-renewals. I understand that my next plan will require a separate checkout and consent.</span>
        </label>
      )}
      <button type="button" className="hb-billing-button hb-billing-button--primary"
        disabled={busy || (cancelExistingAuto && !acknowledged) || (planId === currentPlan && mode === currentMode && !preference)}
        onClick={() => void scheduleChange()}>
        {busy && <LoaderCircle className="hb-billing-spin" size={16} aria-hidden="true" />}
        {busy ? "Saving securely…" : "Save next-period preference"}
      </button>
      {error && <p className="hb-billing-error" role="alert">{error}</p>}
      {success && <p className="hb-billing-message" role="status">{success}</p>}
      <p className="hb-billing-fineprint">This is not a mid-cycle upgrade, refund, prorated charge, or automatic plan switch. Already authorized provider renewals must be cancelled before a new plan is selected.</p>
    </section>
  );
}

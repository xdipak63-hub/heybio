import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { PLANS, requiresPayment, type PlanId } from "../../lib/plans";

type Mode = "manual" | "auto";
type CheckoutResponse = {
  mode: Mode; subscriptionId?: string; orderId?: string; amountPaise?: number;
  razorpayKeyId: string; planId: PlanId; currency: "INR";
};
type RazorpayPayload = {
  razorpay_payment_id?: string; razorpay_order_id?: string;
  razorpay_subscription_id?: string; razorpay_signature?: string;
};
type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: () => void) => void;
};
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;
declare global { interface Window { Razorpay?: RazorpayConstructor; } }
type Props = { planId: PlanId; disabled?: boolean; className?: string; label?: string;
  initialMode?: Mode; onVerificationPending?: () => void; };
let scriptPromise: Promise<void> | null = null;
function loadCheckout(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser required"));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Payment checkout unavailable"));
    script.onerror = () => reject(new Error("Payment checkout could not load"));
    document.head.appendChild(script);
  }).catch((error: unknown) => { scriptPromise = null; throw error; });
  return scriptPromise;
}

export default function CheckoutButton({ planId, disabled = false, className = "", label, initialMode = "manual", onVerificationPending }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const releaseCheckoutLock = () => {
    inFlight.current = false;
    if (mounted.current) setBusy(false);
  };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function startCheckout() {
    if (inFlight.current || disabled || !requiresPayment(planId)) return;
    inFlight.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      await loadCheckout();
      const response = await fetch("/api/checkout", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ planId, mode })
      });
      const result = (await response.json()) as CheckoutResponse & { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to start checkout");
      if (!result || result.planId !== planId || result.mode !== mode || !result.razorpayKeyId ||
          (mode === "manual" ? !result.orderId || result.amountPaise !== PLANS[planId].monthlyPriceInr * 100
                             : !result.subscriptionId)) {
        throw new Error("Unexpected checkout response");
      }
      if (!window.Razorpay) throw new Error("Payment provider unavailable");
      const checkout = new window.Razorpay({
        key: result.razorpayKeyId,
        ...(mode === "manual"
          ? { order_id: result.orderId, amount: result.amountPaise, currency: "INR" }
          : { subscription_id: result.subscriptionId }),
        name: "HEYBIO",
        description: mode === "manual"
          ? `${PLANS[planId].name} · one month · no automatic debit`
          : `${PLANS[planId].name} · monthly auto-renewal · 12 billing cycles`,
        theme: { color: "#1D1D1F" },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (mounted.current) setMessage("Checkout closed. Check billing before trying another payment.");
            releaseCheckoutLock();
          }
        },
        handler: (payload: RazorpayPayload) => {
          void (async () => {
            if (mounted.current) setMessage("Confirming payment with Razorpay…");
            if (!payload.razorpay_payment_id || !payload.razorpay_signature) {
              throw new Error("Payment confirmation details missing");
            }
            const verifyResponse = await fetch("/api/payment-verify", {
              method: "POST", credentials: "same-origin",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({
                mode, razorpay_payment_id: payload.razorpay_payment_id,
                razorpay_signature: payload.razorpay_signature,
                ...(mode === "manual" ? { razorpay_order_id: result.orderId }
                  : { razorpay_subscription_id: result.subscriptionId })
              })
            });
            const verification = (await verifyResponse.json()) as {
              ok?: boolean; status?: string; error?: string;
            };
            if (!verifyResponse.ok && verifyResponse.status !== 202) {
              throw new Error(verification.error || "Verification could not be completed");
            }
            if (verification.status === "verified") {
              if (mounted.current) setMessage("Payment verified. Opening billing…");
              window.location.assign("/dashboard/billing");
            } else {
              if (mounted.current) setMessage("Payment received; server verification is pending. Check billing before retrying.");
              onVerificationPending?.();
            }
          })().catch((cause: unknown) => {
            if (mounted.current) setError(cause instanceof Error ? cause.message : "Please check billing before retrying");
            onVerificationPending?.();
          }).finally(() => releaseCheckoutLock());
        }
      });
      checkout.on("payment.failed", () => {
        if (mounted.current) setError("Payment was not completed. Check billing before retrying.");
      });
      checkout.open();
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : "Checkout unavailable");
      releaseCheckoutLock();
    }
  }
  return <div className="hb-billing-checkout">
    <fieldset style={{ border: 0, padding: 0, margin: "0 0 12px", display: "grid", gap: 7 }} disabled={busy || disabled}>
      <legend style={{ fontWeight: 700, marginBottom: 6 }}>Choose your billing method</legend>
      <label style={{ display: "flex", alignItems: "start", gap: 9, cursor: "pointer" }}>
        <input type="radio" name={`billing-${planId}`} value="manual" checked={mode === "manual"} onChange={() => setMode("manual")} />
        <span><strong>Pay once</strong> — ₹{PLANS[planId].monthlyPriceInr} for one month; renew manually.</span>
      </label>
      <label style={{ display: "flex", alignItems: "start", gap: 9, cursor: "pointer" }}>
        <input type="radio" name={`billing-${planId}`} value="auto" checked={mode === "auto"} onChange={() => setMode("auto")} />
        <span><strong>Auto-renew monthly</strong> — ₹{PLANS[planId].monthlyPriceInr}/month, up to 12 cycles, with your Razorpay authorization. Cancel future renewals in billing.</span>
      </label>
    </fieldset>
    <button type="button" className={`hb-billing-button hb-billing-button--primary ${className}`}
      onClick={() => void startCheckout()} disabled={disabled || busy || !requiresPayment(planId)} aria-busy={busy}>
      {busy ? <LoaderCircle size={17} className="hb-billing-spin" aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
      {busy ? "Preparing checkout…" : label || `Choose ${PLANS[planId].name}`}
    </button>
    <p className="hb-billing-fineprint">Plan activates only after secure provider verification. The selected renewal method is not changed without your choice.</p>
    {error && <p className="hb-billing-error" role="alert">{error}</p>}
    {message && <p className="hb-billing-message" role="status">{message}</p>}
  </div>;
}

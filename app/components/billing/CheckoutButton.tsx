
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import {
  PLANS,
  requiresPayment,
  type PlanId
} from "../../lib/plans";

type CheckoutResponse = {
  subscriptionId: string;
  razorpayKeyId: string;
  planId: PlanId;
  currency: "INR";
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: () => void) => void;
};

type RazorpayConstructor = new (
  options: Record<string, unknown>
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  planId: PlanId;
  disabled?: boolean;
  className?: string;
  label?: string;
  onVerificationPending?: () => void;
};

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser required."));
  }

  if (window.Razorpay) return Promise.resolve();

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) resolve();
        else reject(new Error("Checkout unavailable."));
      };
      script.onerror = () => reject(new Error("Checkout could not load."));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      razorpayScriptPromise = null;
      throw error;
    });
  }

  return razorpayScriptPromise;
}

export default function CheckoutButton({
  planId,
  disabled = false,
  className = "",
  label,
  onVerificationPending
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const mounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function startCheckout() {
    if (inFlight.current || disabled || !requiresPayment(planId)) return;

    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      // Load before creating a subscription, so a blocked
      // third-party script does not leave a pending checkout.
      await loadRazorpay();

      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ planId })
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to start checkout.";

        throw new Error(message);
      }

      if (
        !result ||
        typeof result !== "object" ||
        !("subscriptionId" in result) ||
        typeof result.subscriptionId !== "string" ||
        !("razorpayKeyId" in result) ||
        typeof result.razorpayKeyId !== "string" ||
        !("planId" in result) ||
        result.planId !== planId
      ) {
        throw new Error("Invalid checkout response.");
      }

      const checkout = result as CheckoutResponse;

      if (!window.Razorpay) {
        throw new Error("Payment provider unavailable.");
      }

      const instance = new window.Razorpay({
        key: checkout.razorpayKeyId,
        subscription_id: checkout.subscriptionId,
        name: "HEYBIO",
        description: `${PLANS[planId].name} monthly subscription`,
        theme: { color: "#1D1D1F" },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (mounted.current) {
              setMessage("Checkout closed. No plan upgrade has been confirmed.");
            }
          }
        },
        handler: () => {
          // Razorpay browser callbacks are not proof of payment.
          // The server webhook must verify and activate the plan.
          if (mounted.current) {
            setMessage(
              "Payment submitted. Your subscription will activate after secure verification."
            );
          }
          onVerificationPending?.();
        }
      });

      instance.on("payment.failed", () => {
        if (mounted.current) {
          setError("Payment was not completed. Check billing before retrying.");
        }
      });

      instance.open();
    } catch (cause) {
      if (mounted.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Checkout is temporarily unavailable."
        );
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <div className="hb-billing-checkout">
      <button
        type="button"
        className={`hb-billing-button hb-billing-button--primary ${className}`}
        onClick={() => void startCheckout()}
        disabled={disabled || busy || !requiresPayment(planId)}
        aria-busy={busy}
      >
        {busy ? (
          <LoaderCircle size={17} className="hb-billing-spin" aria-hidden="true" />
        ) : (
          <ArrowUpRight size={17} aria-hidden="true" />
        )}
        {busy ? "Preparing checkout…" : label || `Choose ${PLANS[planId].name}`}
      </button>

      <p className="hb-billing-fineprint">
        Monthly recurring subscription. Payment authorization is required.
      </p>

      {error && <p className="hb-billing-error" role="alert">{error}</p>}
      {message && <p className="hb-billing-message" role="status">{message}</p>}
    </div>
  );
}

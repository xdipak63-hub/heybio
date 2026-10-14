
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

type Props = {
  disabled?: boolean;
  onCancelled?: () => void;
};

type CancelResponse = {
  ok?: boolean;
  error?: string;
  providerStatus?: string;
  cancelAtCycleEnd?: boolean;
};

export default function CancelSubscription({
  disabled = false,
  onCancelled
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function openDialog() {
    if (disabled || busy) return;
    setError("");
    dialogRef.current?.showModal();
    cancelButtonRef.current?.focus();
  }

  function closeDialog() {
    if (!busy) dialogRef.current?.close();
  }

  useEffect(() => {
    return () => {
      dialogRef.current?.close();
    };
  }, []);

  async function confirmCancellation() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/subscription-cancel", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" }
      });

      const result = (await response.json()) as CancelResponse;

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "Cancellation could not be completed."
        );
      }

      dialogRef.current?.close();

      setMessage(
        result.cancelAtCycleEnd
          ? "Cancellation request accepted. Your subscription is scheduled to end after the current billing cycle. Refresh your billing status for confirmation."
          : "Cancellation request accepted. Your updated billing status will be confirmed by the payment provider."
      );

      onCancelled?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to cancel subscription."
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="hb-cancel-subscription">
      <button
        type="button"
        className="hb-billing-text-button"
        disabled={disabled || busy}
        onClick={openDialog}
      >
        Cancel subscription
      </button>

      {message && <p className="hb-billing-message" role="status">{message}</p>}

      <dialog
        ref={dialogRef}
        className="hb-billing-dialog"
        aria-labelledby="hb-cancel-title"
        aria-describedby="hb-cancel-description"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <div className="hb-billing-dialog__top">
          <span className="hb-billing-dialog__warning">
            <AlertTriangle size={22} aria-hidden="true" />
          </span>
          <button
            type="button"
            className="hb-billing-dialog__close"
            aria-label="Close"
            disabled={busy}
            onClick={closeDialog}
          >
            <X size={19} />
          </button>
        </div>

        <h2 id="hb-cancel-title">Cancel your subscription?</h2>
        <p id="hb-cancel-description">
          This will request cancellation of your recurring HEYBIO
          subscription. Active subscriptions are normally scheduled
          to end at the current billing cycle; other subscription
          states may be cancelled immediately.
        </p>

        <p className="hb-billing-dialog__hint">
          Paid features, including eligible HYPE DROP access, depend
          on your verified subscription status.
        </p>

        {error && <p className="hb-billing-error" role="alert">{error}</p>}

        <div className="hb-billing-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="hb-billing-button hb-billing-button--secondary"
            disabled={busy}
            onClick={closeDialog}
          >
            Keep my plan
          </button>
          <button
            type="button"
            className="hb-billing-button hb-billing-button--danger"
            disabled={busy}
            onClick={() => void confirmCancellation()}
          >
            {busy && <LoaderCircle size={16} className="hb-billing-spin" />}
            {busy ? "Processing…" : "Confirm cancellation"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

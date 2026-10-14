
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AlertTriangle, X } from "lucide-react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  children,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  async function handleConfirm() {
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch {
      setError(
        "The action could not be completed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="heybio-confirm-title"
      aria-describedby="heybio-confirm-description"
      onCancel={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }

        onClose();
      }}
      onClick={(event) => {
        if (
          event.target === dialogRef.current &&
          !pending
        ) {
          onClose();
        }
      }}
      style={{
        width: "min(440px, calc(100% - 32px))",
        border: "1px solid #E4E7DF",
        borderRadius: 24,
        padding: 28,
        background: "#FFFFFF",
        color: "#171817",
        boxShadow: "0 30px 90px #00000030",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 50,
            height: 50,
            borderRadius: 16,
            background: destructive
              ? "#FEE2E2"
              : "#EFF9D9",
            color: destructive
              ? "#B91C1C"
              : "#536F00",
          }}
        >
          <AlertTriangle size={24} />
        </span>

        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close dialog"
          style={{
            background: "transparent",
            border: 0,
            padding: 5,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <h2
        id="heybio-confirm-title"
        style={{
          fontSize: 24,
          margin: "20px 0 10px",
        }}
      >
        {title}
      </h2>

      <p
        id="heybio-confirm-description"
        style={{
          color: "#666C63",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>

      {children}

      {error && (
        <p
          role="alert"
          style={{
            color: "#B91C1C",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          marginTop: 28,
          flexWrap: "wrap",
        }}
      >
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={pending}
          style={{
            padding: "12px 20px",
            borderRadius: 100,
            border: "1px solid #D8DCD3",
            background: "#FFFFFF",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          aria-busy={pending}
          style={{
            padding: "12px 20px",
            borderRadius: 100,
            border: 0,
            background: destructive
              ? "#DC2626"
              : "#BDF806",
            color: destructive
              ? "#FFFFFF"
              : "#171817",
            fontWeight: 700,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {pending ? "Processing..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;


import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";

import { AlertTriangle, X } from "lucide-react";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireText?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  requireText,
  busy = false,
  error,
  onConfirm,
  onClose
}: AdminConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setConfirmation("");
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  const confirmed =
    !requireText || confirmation === requireText;

  function handleClose() {
    if (!busy) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="hb-admin-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClose={() => {
        if (open && !busy) onClose();
      }}
    >
      <div className="hb-admin-dialog__header">
        <div
          className={
            destructive
              ? "hb-admin-dialog__icon is-danger"
              : "hb-admin-dialog__icon"
          }
          aria-hidden="true"
        >
          <AlertTriangle size={21} />
        </div>

        <button
          type="button"
          className="hb-admin-icon-button"
          onClick={handleClose}
          disabled={busy}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <h2 id={titleId}>{title}</h2>

      <p id={descriptionId}>{description}</p>

      {requireText && (
        <div className="hb-admin-dialog__field">
          <label htmlFor={`${titleId}-confirm`}>
            Type <strong>{requireText}</strong> to confirm
          </label>

          <input
            id={`${titleId}-confirm`}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={confirmation}
            disabled={busy}
            onChange={(event) =>
              setConfirmation(event.target.value)
            }
          />
        </div>
      )}

      {error && (
        <p role="alert" className="hb-admin-dialog__error">
          {error}
        </p>
      )}

      <div className="hb-admin-dialog__actions">
        <button
          ref={cancelRef}
          type="button"
          className="hb-admin-button hb-admin-button--secondary"
          disabled={busy}
          onClick={handleClose}
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          className={
            destructive
              ? "hb-admin-button hb-admin-button--danger"
              : "hb-admin-button hb-admin-button--primary"
          }
          disabled={busy || !confirmed}
          onClick={() => {
            if (confirmed && !busy) {
              void onConfirm();
            }
          }}
        >
          {busy ? "Processing…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

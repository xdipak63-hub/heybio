
import {
  useEffect,
  useId,
  useRef,
  type ReactNode
} from "react";
import { X } from "lucide-react";

export type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  busy?: boolean;
  closeOnBackdrop?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  busy = false,
  closeOnBackdrop = true,
  size = "md",
  className = ""
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function requestClose() {
    if (!busy) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`hb-ui-dialog hb-ui-dialog--${size} ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        if (open && !busy) onClose();
      }}
      onClick={(event) => {
        if (
          closeOnBackdrop &&
          event.target === dialogRef.current
        ) {
          requestClose();
        }
      }}
    >
      <div className="hb-ui-dialog__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && (
            <p id={descriptionId}>{description}</p>
          )}
        </div>

        <button
          ref={closeRef}
          type="button"
          className="hb-ui-icon-button"
          onClick={requestClose}
          disabled={busy}
          aria-label="Close dialog"
        >
          <X size={19} />
        </button>
      </div>

      <div className="hb-ui-dialog__body">
        {children}
      </div>

      {footer && (
        <div className="hb-ui-dialog__footer">
          {footer}
        </div>
      )}
    </dialog>
  );
}

export default Dialog;

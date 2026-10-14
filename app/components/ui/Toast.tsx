
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  X
} from "lucide-react";

export type ToastVariant =
  | "success"
  | "error"
  | "info";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastRecord = ToastOptions & {
  id: string;
  createdAt: number;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(
  null
);

const MAX_TOASTS = 4;

let nextToastId = 0;

export function ToastProvider({
  children
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = `hb-toast-${++nextToastId}`;

    setToasts((current) => [
      ...current.slice(-(MAX_TOASTS - 1)),
      {
        ...options,
        id,
        createdAt: Date.now(),
        variant: options.variant ?? "info"
      }
    ]);

    return id;
  }, []);

  const value = useMemo(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="hb-ui-toast-viewport"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <ToastItem
            key={item.id}
            item={item}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  item,
  onDismiss
}: {
  item: ToastRecord;
  onDismiss: () => void;
}) {
  const variant = item.variant ?? "info";

  useEffect(() => {
    const duration =
      item.duration === 0
        ? 0
        : Math.max(
            1000,
            Math.min(item.duration ?? 5000, 30000)
          );

    if (duration === 0) return;

    const timeout = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeout);
  }, [item.id, item.duration, onDismiss]);

  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className={`hb-ui-toast hb-ui-toast--${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon
        size={20}
        aria-hidden="true"
        className="hb-ui-toast__icon"
      />

      <div className="hb-ui-toast__content">
        <strong>{item.title}</strong>
        {item.description && <p>{item.description}</p>}
      </div>

      <button
        type="button"
        className="hb-ui-icon-button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <X size={17} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider."
    );
  }

  return context;
}

export default ToastProvider;

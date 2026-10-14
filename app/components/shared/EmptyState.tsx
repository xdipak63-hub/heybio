
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={className}
      aria-labelledby="heybio-empty-title"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: compact ? "28px 18px" : "64px 24px",
        border: "1px dashed #D9DDD3",
        borderRadius: 24,
        background: "#FCFCFA",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "#EFF9D9",
          color: "#354A00",
          display: "grid",
          placeItems: "center",
          marginBottom: 20,
        }}
      >
        {icon ?? <Inbox size={28} strokeWidth={1.8} />}
      </div>

      <h3
        id="heybio-empty-title"
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          margin: "0 0 10px",
          color: "#171817",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#686E65",
            maxWidth: 380,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <div style={{ marginTop: 24 }}>{action}</div>
      )}
    </section>
  );
}

export default EmptyState;


import { LoaderCircle } from "lucide-react";

export type LoadingStateProps = {
  label?: string;
  description?: string;
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: 20,
  md: 32,
  lg: 46,
};

export function LoadingState({
  label = "Loading...",
  description,
  fullPage = false,
  size = "md",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        minHeight: fullPage ? "70vh" : 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 24,
        textAlign: "center",
      }}
    >
      <LoaderCircle
        size={sizes[size]}
        strokeWidth={2}
        aria-hidden="true"
        style={{
          color: "#83AE00",
          animation: "heybio-spin 0.9s linear infinite",
        }}
      />

      <strong
        style={{
          fontSize: 15,
          color: "#171817",
        }}
      >
        {label}
      </strong>

      {description && (
        <p
          style={{
            margin: 0,
            maxWidth: 340,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#777B72",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default LoadingState;

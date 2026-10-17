
import type { CSSProperties } from "react";

export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  href?: string;
  showTagline?: boolean;
  className?: string;
};

const SIZES = {
  sm: { icon: 30, wordmark: 22 },
  md: { icon: 38, wordmark: 29 },
  lg: { icon: 48, wordmark: 40 },
} as const;

export default function Logo({
  size = "md",
  variant = "dark",
  href = "/",
  showTagline = false,
  className,
}: LogoProps) {
  const scale = SIZES[size];

  const color =
    variant === "light"
      ? "#FFFFFF"
      : "#1D1D1F";

  const image =
    variant === "light"
      ? "/brand-mark-white.svg"
      : "/brand-mark.svg";

  const outerStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    color,
    textDecoration: "none",
    maxWidth: "100%",
  };

  const content = (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        maxWidth: "100%",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          color,
          whiteSpace: "nowrap",
        }}
      >
        <img
          src={image}
          width={scale.icon}
          height={scale.icon}
          alt=""
          aria-hidden="true"
          style={{
            display: "block",
            flexShrink: 0,
            objectFit: "contain",
          }}
        />

        <span
          style={{
            fontFamily:
              'Inter, "Geist", system-ui, sans-serif',
            fontSize: scale.wordmark,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            lineHeight: 1,
          }}
        >
          HEYBIO
          <span aria-hidden="true"> ↗</span>
        </span>
      </span>

      {showTagline && (
        <span
          style={{
            marginTop: 7,
            color,
            opacity: 0.76,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          YOUR WORLD. ONE LINK.
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={outerStyle}
        aria-label="HEYBIO homepage"
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={className}
      style={outerStyle}
      aria-label="HEYBIO by DIPO LABS"
    >
      {content}
    </span>
  );
}
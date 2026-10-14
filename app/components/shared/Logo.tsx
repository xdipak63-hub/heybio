
import type { CSSProperties } from "react";

export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  href?: string;
  showTagline?: boolean;
  className?: string;
};

const fontSizes = {
  sm: 23,
  md: 31,
  lg: 44,
};

export function Logo({
  size = "md",
  variant = "dark",
  href = "/",
  showTagline = false,
  className,
}: LogoProps) {
  const color =
    variant === "light" ? "#FFFFFF" : "#171817";

  const content = (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontFamily:
            '"Space Grotesk", "DM Sans", sans-serif',
          fontSize: fontSizes[size],
          fontWeight: 800,
          letterSpacing: "-0.085em",
          lineHeight: 1,
          color,
          whiteSpace: "nowrap",
        }}
      >
        HEYBIO
        <span
          aria-hidden="true"
          style={{
            color: "#9CCB00",
            letterSpacing: 0,
            marginLeft: 3,
          }}
        >
          ↗
        </span>
      </span>

      {showTagline && (
        <span
          style={{
            marginTop: 7,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color,
            opacity: 0.7,
          }}
        >
          BY DIPO LABS
        </span>
      )}
    </span>
  );

  const commonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
  };

  if (!href) {
    return (
      <span
        className={className}
        style={commonStyle}
        aria-label="HEYBIO by DIPO LABS"
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={className}
      style={commonStyle}
      aria-label="HEYBIO homepage"
    >
      {content}
    </a>
  );
}

export default Logo;

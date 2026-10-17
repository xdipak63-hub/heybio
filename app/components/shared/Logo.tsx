import type { CSSProperties } from "react";

export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  href?: string;
  showTagline?: boolean;
  className?: string;
};

const SCALE = {
  sm: { icon: 30, text: 22 },
  md: { icon: 38, text: 29 },
  lg: { icon: 48, text: 40 },
} as const;

/** Official HEYBIO mark + editable wordmark. Source: approved owner artwork. */
export function Logo({
  size = "md",
  variant = "dark",
  href = "/",
  showTagline = false,
  className,
}: LogoProps) {
  const { icon, text } = SCALE[size];
  const color = variant === "light" ? "#FFFFFF" : "#1D1D1F";
  const image = variant === "light" ? "/brand-mark-white.svg" : "/brand-mark.svg";
  const content = (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "100%" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", color }}>
        <img
          src={image}
          width={icon}
          height={icon}
          alt=""
          aria-hidden="true"
          style={{ display: "block", width: icon, height: icon, objectFit: "contain", flexShrink: 0 }}
        />
        <span style={{ fontFamily: 'Inter, "Space Grotesk", system-ui, sans-serif', fontSize: text, fontWeight: 800, letterSpacing: "-0.07em", lineHeight: 1 }}>
          HEYBIO<span aria-hidden="true"> ↗</span>
        </span>
      </span>
      {showTagline && (
        <span style={{ marginTop: 7, fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color, opacity: 0.76 }}>
          YOUR WORLD. ONE LINK. · BY DIPO LABS
        </span>
      )}
    </span>
  );

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    color,
    textDecoration: "none",
  };

  return href ? (
    <a href={href} className={className} style={style} aria-label="HEYBIO homepage">
      {content}
    </a>
  ) : (
    <span className={className} style={style} aria-label="HEYBIO by DIPO LABS">
      {content}
    </span>
  );
}

export default Logo;

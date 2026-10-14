
import type { CSSProperties } from "react";

export type SkeletonProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  radius?: CSSProperties["borderRadius"];
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({
  width = "100%",
  height = 18,
  radius = 10,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #E9ECE5 25%, #F5F6F2 50%, #E9ECE5 75%)",
        backgroundSize: "200% 100%",
        animation: "heybio-skeleton 1.6s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function TextSkeleton({
  lines = 3,
}: {
  lines?: number;
}) {
  const safeLines = Math.max(1, Math.min(lines, 12));

  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{ display: "grid", gap: 12 }}
    >
      {Array.from({ length: safeLines }, (_, index) => (
        <Skeleton
          key={index}
          height={14}
          width={
            index === safeLines - 1 ? "65%" : "100%"
          }
        />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: 28,
        display: "grid",
        justifyItems: "center",
        gap: 16,
      }}
    >
      <Skeleton width={92} height={92} radius="50%" />
      <Skeleton width={160} height={24} />
      <Skeleton width={230} height={14} />

      <div
        style={{
          width: "100%",
          display: "grid",
          gap: 12,
          marginTop: 20,
        }}
      >
        <Skeleton height={58} radius={16} />
        <Skeleton height={58} radius={16} />
        <Skeleton height={58} radius={16} />
      </div>
    </div>
  );
}

export default Skeleton;

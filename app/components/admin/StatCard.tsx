
import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus
} from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number | null;
  icon?: ReactNode;
  description?: string;
  change?: number | null;
  loading?: boolean;
  format?: "number" | "currency" | "text";
};

const numberFormatter = new Intl.NumberFormat("en-IN");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function StatCard({
  label,
  value,
  icon,
  description,
  change,
  loading = false,
  format = "text"
}: StatCardProps) {
  const displayValue =
    value === null || value === undefined
      ? "—"
      : typeof value === "number" && format === "currency"
        ? currencyFormatter.format(value)
        : typeof value === "number" && format === "number"
          ? numberFormatter.format(value)
          : String(value);

  const validChange =
    typeof change === "number" &&
    Number.isFinite(change);

  const positive = validChange && change > 0;
  const negative = validChange && change < 0;

  return (
    <section
      className="hb-admin-stat"
      aria-label={label}
      aria-busy={loading}
    >
      <div className="hb-admin-stat__top">
        <span className="hb-admin-stat__label">
          {label}
        </span>

        {icon && (
          <span
            className="hb-admin-stat__icon"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="hb-admin-stat__value">
        {loading ? (
          <span
            className="hb-admin-stat__skeleton"
            aria-label="Loading"
          />
        ) : (
          displayValue
        )}
      </div>

      {(description || validChange) && (
        <div className="hb-admin-stat__bottom">
          {validChange && (
            <span
              className={[
                "hb-admin-stat__change",
                positive ? "is-positive" : "",
                negative ? "is-negative" : ""
              ].join(" ")}
            >
              {positive ? (
                <ArrowUpRight size={14} />
              ) : negative ? (
                <ArrowDownRight size={14} />
              ) : (
                <Minus size={14} />
              )}

              {Math.abs(change).toFixed(1)}%
            </span>
          )}

          {description && (
            <span className="hb-admin-stat__description">
              {description}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

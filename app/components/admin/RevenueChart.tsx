
import { useId } from "react";
import {
  formatAdminCurrency,
  type AdminRevenuePoint
} from "../../types/admin-ui";

type Props = {
  data: AdminRevenuePoint[];
  title?: string;
  description?: string;
  loading?: boolean;
};

export default function RevenueChart({
  data,
  title = "Revenue overview",
  description = "Verified payment revenue",
  loading = false
}: Props) {
  const chartId = useId();

  const validData = data.filter(
    (item) =>
      Number.isFinite(item.amountPaise) &&
      item.amountPaise >= 0
  );

  const maxValue = Math.max(
    1,
    ...validData.map((item) => item.amountPaise)
  );

  const total = validData.reduce(
    (sum, item) => sum + item.amountPaise,
    0
  );

  return (
    <section
      className="hb-admin-panel hb-admin-revenue"
      aria-labelledby={chartId}
      aria-busy={loading}
    >
      <div className="hb-admin-panel__heading">
        <div>
          <h2 id={chartId}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {loading ? (
        <p role="status">Loading revenue data…</p>
      ) : validData.length === 0 ? (
        <div className="hb-admin-empty">
          <strong>No revenue data available</strong>
          <p>
            Connect verified payment records to display
            the chart.
          </p>
        </div>
      ) : (
        <>
          <div className="hb-admin-revenue__summary">
            <span>Total for displayed periods</span>
            <strong>
              {formatAdminCurrency(total)}
            </strong>
          </div>

          <div
            className="hb-admin-revenue__chart"
            role="img"
            aria-label={`Revenue chart with ${validData.length} periods. Total ${formatAdminCurrency(total)}.`}
          >
            {validData.map((item, index) => {
              const height =
                (item.amountPaise / maxValue) * 100;

              return (
                <div
                  className="hb-admin-revenue__column"
                  key={`${item.label}-${index}`}
                  title={`${item.label}: ${formatAdminCurrency(item.amountPaise)}`}
                >
                  <div className="hb-admin-revenue__track">
                    <div
                      className="hb-admin-revenue__bar"
                      style={{
                        height: `${height}%`
                      }}
                    />
                  </div>

                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="hb-admin-revenue__accessible-table">
            <table>
              <caption>Revenue by period</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {validData.map((item, index) => (
                  <tr key={`${item.label}-${index}`}>
                    <td>{item.label}</td>
                    <td>
                      {formatAdminCurrency(item.amountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

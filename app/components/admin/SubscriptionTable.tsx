
import {
  CreditCard
} from "lucide-react";

import {
  formatAdminCurrency,
  formatAdminDate,
  type AdminSubscriptionRow
} from "../../types/admin-ui";

type Props = {
  subscriptions: AdminSubscriptionRow[];
  loading?: boolean;
};

export default function SubscriptionTable({
  subscriptions,
  loading = false
}: Props) {
  return (
    <section
      className="hb-admin-panel"
      aria-label="Subscriptions"
      aria-busy={loading}
    >
      <div className="hb-admin-panel__heading">
        <div>
          <h2>Subscriptions</h2>
          <p>Verified subscription records.</p>
        </div>
      </div>

      <div className="hb-admin-table-scroll">
        <table className="hb-admin-table">
          <thead>
            <tr>
              <th scope="col">Subscriber</th>
              <th scope="col">Plan</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Next billing</th>
              <th scope="col">Created</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>
                    {item.userEmail || "Unknown subscriber"}
                  </strong>
                  <span className="hb-admin-table__subtext">
                    ID: {item.id}
                  </span>
                </td>

                <td>{item.plan}</td>

                <td>
                  {formatAdminCurrency(item.amountPaise)}
                </td>

                <td>
                  <span
                    className={`hb-admin-status hb-admin-status--${item.status}`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </td>

                <td>{formatAdminDate(item.nextBillingAt)}</td>
                <td>{formatAdminDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="hb-admin-table-message" role="status">
          Loading subscriptions…
        </p>
      )}

      {!loading && subscriptions.length === 0 && (
        <div className="hb-admin-empty">
          <CreditCard size={25} aria-hidden="true" />
          <strong>No subscriptions found</strong>
          <p>No records match the current view.</p>
        </div>
      )}
    </section>
  );
}

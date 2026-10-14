
import { FileClock } from "lucide-react";

import {
  formatAdminDate,
  type AdminAuditRow
} from "../../types/admin-ui";

type Props = {
  logs: AdminAuditRow[];
  loading?: boolean;
};

function formatAction(value: string): string {
  return value
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

export default function AuditLogTable({
  logs,
  loading = false
}: Props) {
  return (
    <section
      className="hb-admin-panel"
      aria-label="Admin audit logs"
      aria-busy={loading}
    >
      <div className="hb-admin-panel__heading">
        <div>
          <h2>Audit activity</h2>
          <p>
            Administrative actions recorded by the server.
          </p>
        </div>
      </div>

      <div className="hb-admin-table-scroll">
        <table className="hb-admin-table">
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">Administrator</th>
              <th scope="col">Target</th>
              <th scope="col">Target ID</th>
              <th scope="col">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <strong>{formatAction(log.action)}</strong>
                </td>

                <td>{log.actorEmail || "Unknown"}</td>
                <td>{log.targetType}</td>

                <td>
                  <code className="hb-admin-table__code">
                    {log.targetId || "—"}
                  </code>
                </td>

                <td>{formatAdminDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="hb-admin-table-message" role="status">
          Loading audit activity…
        </p>
      )}

      {!loading && logs.length === 0 && (
        <div className="hb-admin-empty">
          <FileClock size={25} aria-hidden="true" />
          <strong>No audit records found</strong>
          <p>
            Administrative activity will appear here
            when records are available.
          </p>
        </div>
      )}
    </section>
  );
}


import { Link } from "react-router";
import { Search, Users } from "lucide-react";
import {
  formatAdminDate,
  type AdminPagination,
  type AdminUserRow
} from "../../types/admin-ui";

type Props = {
  users: AdminUserRow[];
  pagination?: AdminPagination;
  search?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  loading?: boolean;
};

export default function UserTable({
  users,
  pagination,
  search = "",
  onSearchChange,
  onPageChange,
  loading = false
}: Props) {
  const totalPages = pagination
    ? Math.max(
        1,
        Math.ceil(pagination.total / pagination.pageSize)
      )
    : 1;

  return (
    <section className="hb-admin-panel" aria-label="User management">
      <div className="hb-admin-panel__heading">
        <div>
          <h2>Users</h2>
          <p>Review registered HEYBIO accounts.</p>
        </div>

        {pagination && (
          <span className="hb-admin-count">
            {pagination.total.toLocaleString("en-IN")} users
          </span>
        )}
      </div>

      {onSearchChange && (
        <div className="hb-admin-table-toolbar">
          <label className="hb-admin-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search users</span>
            <input
              type="search"
              placeholder="Search users"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
            />
          </label>
        </div>
      )}

      <div className="hb-admin-table-scroll">
        <table className="hb-admin-table">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Username</th>
              <th scope="col">Plan</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col">Details</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.displayName || "Unnamed user"}</strong>
                  <span className="hb-admin-table__subtext">
                    {user.email}
                  </span>
                </td>

                <td>{user.username ? `@${user.username}` : "—"}</td>
                <td>{user.plan || "—"}</td>

                <td>
                  <span
                    className={`hb-admin-status hb-admin-status--${user.status}`}
                  >
                    {user.status.replace("_", " ")}
                  </span>
                </td>

                <td>{formatAdminDate(user.createdAt)}</td>

                <td>
                  <Link
                    className="hb-admin-table__link"
                    to={`/admin/users/${encodeURIComponent(user.id)}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && users.length === 0 && (
        <div className="hb-admin-empty">
          <Users size={25} aria-hidden="true" />
          <strong>No users found</strong>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {loading && (
        <p className="hb-admin-table-message" role="status">
          Loading users…
        </p>
      )}

      {pagination && totalPages > 1 && (
        <div className="hb-admin-pagination">
          <span>
            Page {pagination.page} of {totalPages}
          </span>

          <div>
            <button
              type="button"
              disabled={loading || pagination.page <= 1}
              onClick={() =>
                onPageChange?.(pagination.page - 1)
              }
            >
              Previous
            </button>

            <button
              type="button"
              disabled={loading || pagination.page >= totalPages}
              onClick={() =>
                onPageChange?.(pagination.page + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

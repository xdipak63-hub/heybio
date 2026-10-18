
import {
  data,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction
} from "react-router";

import {
  requireAdminPage,
} from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  formatAdminDate,
} from "../../types/admin-ui";

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Security — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const admin = await requireAdminPage(
    request,
    context,
    "audit.read",
  );

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const [roles, audit] = await Promise.all([
    db
      .from("admin_roles")
      .select("user_id,is_active,role")
      .eq("role", "super_admin"),

    db
      .from("admin_audit_logs")
      .select(
        "id,action,target_type,created_at",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(12),
  ]);

  if (roles.error || audit.error) {
    throw new Response(
      "Security overview unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  return data(
    {
      currentAdminId: admin.user.id,

      activeRoles: (roles.data ?? []).filter(
        (role) => role.is_active,
      ).length,

      recent: audit.data ?? [],
    },
    { headers: HEADERS },
  );
}

export default function AdminSecurity() {
  const {
    currentAdminId,
    activeRoles,
    recent,
  } = useLoaderData<typeof loader>();

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          IDENTITY & ACCOUNTABILITY
        </p>

        <h2>Security center</h2>

        <p>
          Protected administration with verified
          owner identity, an active server-side
          role and MFA assurance.
        </p>
      </header>

      <div className="hb-ops__tiles">
        <div className="hb-ops__tile">
          <span>Verified session</span>

          <strong>Protected</strong>

          <small>
            Admin ID ending{" "}
            {currentAdminId.slice(-8)}
          </small>
        </div>

        <div className="hb-ops__tile">
          <span>
            Active administrator roles
          </span>

          <strong>{activeRoles}</strong>

          <small>
            Database records; not a count
            of online sessions.
          </small>
        </div>
      </div>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>
            Recent privileged actions
          </strong>

          <Link to="/admin/audit-logs">
            View audit log ↗
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="hb-ops__empty">
            No recorded privileged actions.
          </p>
        ) : (
          <div className="hb-ops__scroll">
            <table className="hb-ops__table">
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Target</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((record) => (
                  <tr key={record.id}>
                    <td>{record.action}</td>
                    <td>{record.target_type}</td>

                    <td>
                      {formatAdminDate(
                        record.created_at,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="hb-ops__note">
        Role edits, MFA resets and security
        policy changes are not exposed from
        this page. Manage those through verified
        procedures, not browser-only state.
      </p>
    </section>
  );
}
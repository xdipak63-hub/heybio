
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  requireAdminPage,
} from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

const SIZE = 20;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Abuse reports — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "users.read",
  );

  const url = new URL(request.url);

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(
        url.searchParams.get("page") || "1",
        10,
      ) || 1,
    ),
  );

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const result = await db
    .from("support_tickets")
    .select(
      "id,user_id,subject,message,status,priority,created_at",
      { count: "exact" },
    )
    .eq("category", "abuse")
    .order("created_at", { ascending: false })
    .range(
      (page - 1) * SIZE,
      page * SIZE - 1,
    );

  if (result.error || result.count === null) {
    throw new Response(
      "Reports unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  return Response.json(
    {
      reports: result.data ?? [],
      total: result.count,
      page,
    },
    { headers: HEADERS },
  );
}

export default function AdminReports() {
  const { reports, total, page } =
    useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          TRUST & SAFETY
        </p>

        <h2>Abuse reports</h2>

        <p>
          Genuine abuse-category support
          submissions. No invented report
          statistics.
        </p>
      </header>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>Submitted reports</strong>

          <span>
            {total.toLocaleString("en-IN")} total
          </span>
        </div>

        {reports.length === 0 ? (
          <p className="hb-ops__empty">
            No abuse reports have been submitted.
          </p>
        ) : (
          <ul className="hb-ops__list">
            {reports.map((report) => (
              <li
                key={report.id}
                className="hb-ops__item"
              >
                <div className="hb-ops__item-top">
                  <strong>{report.subject}</strong>

                  <span className="hb-ops__pill">
                    {report.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>
                </div>

                <p className="hb-ops__message">
                  {report.message}
                </p>

                <div className="hb-ops__meta">
                  <span>
                    Priority: {report.priority}
                  </span>

                  <time dateTime={report.created_at}>
                    {new Date(
                      report.created_at,
                    ).toLocaleString("en-IN")}
                  </time>

                  <Link
                    to={`/admin/users/${report.user_id}`}
                  >
                    Account details ↗
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="hb-ops__note">
        Dedicated reports, evidence attachments
        and review decisions require a separate
        moderation backend. This screen reads
        existing abuse tickets only.
      </p>

      <nav
        className="hb-ops__pager"
        aria-label="Reports pages"
      >
        <Link
          aria-disabled={page <= 1}
          to={`?page=${Math.max(1, page - 1)}`}
        >
          ← Previous
        </Link>

        <span>
          Page {page} of {pages}
        </span>

        <Link
          aria-disabled={page >= pages}
          to={`?page=${Math.min(pages, page + 1)}`}
        >
          Next →
        </Link>
      </nav>
    </section>
  );
}
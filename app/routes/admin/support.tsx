
import {
  data,
  Form,
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

const SIZE = 15;

const STATUSES = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
] as const;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Support — HEYBIO Admin" },
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

  const candidate =
    url.searchParams.get("status") ?? "all";

  const status = STATUSES.includes(
    candidate as (typeof STATUSES)[number],
  )
    ? candidate
    : "all";

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  let query = db
    .from("support_tickets")
    .select(
      "id,user_id,subject,message,category,priority,status,created_at",
      { count: "exact" },
    );

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const result = await query
    .order("created_at", {
      ascending: false,
    })
    .range(
      (page - 1) * SIZE,
      page * SIZE - 1,
    );

  if (result.error || result.count === null) {
    throw new Response(
      "Support tickets unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  return data(
    {
      tickets: result.data ?? [],
      total: result.count,
      page,
      status,
    },
    { headers: HEADERS },
  );
}

export default function AdminSupport() {
  const {
    tickets,
    total,
    page,
    status,
  } = useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  const pageUrl = (nextPage: number) =>
    `?${new URLSearchParams({
      page: String(nextPage),
      ...(status !== "all" ? { status } : {}),
    })}`;

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          CREATOR CARE
        </p>

        <h2>Support inbox</h2>

        <p>
          Read real support tickets. Ticket updates
          are intentionally disabled until an
          audited, CSRF-protected mutation flow
          is implemented.
        </p>
      </header>

      <Form
        method="get"
        className="hb-ops__filter"
      >
        <label htmlFor="ticket-status">
          Ticket status
        </label>

        <select
          id="ticket-status"
          name="status"
          defaultValue={status}
        >
          <option value="all">
            All statuses
          </option>

          {STATUSES.map((item) => (
            <option
              value={item}
              key={item}
            >
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button type="submit">
          Filter
        </button>
      </Form>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>Support requests</strong>

          <span>
            {total.toLocaleString("en-IN")} matching
          </span>
        </div>

        {tickets.length === 0 ? (
          <p className="hb-ops__empty">
            No support tickets match this filter.
          </p>
        ) : (
          <ul className="hb-ops__list">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="hb-ops__item"
              >
                <div className="hb-ops__item-top">
                  <strong>
                    {ticket.subject}
                  </strong>

                  <span className="hb-ops__pill">
                    {ticket.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>
                </div>

                <p className="hb-ops__message">
                  {ticket.message}
                </p>

                <div className="hb-ops__meta">
                  <span>
                    {ticket.category} ·{" "}
                    {ticket.priority}
                  </span>

                  <time dateTime={ticket.created_at}>
                    {new Date(
                      ticket.created_at,
                    ).toLocaleString("en-IN")}
                  </time>

                  <Link
                    to={`/admin/users/${ticket.user_id}`}
                  >
                    View account ↗
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav
        className="hb-ops__pager"
        aria-label="Support pages"
      >
        <Link
          aria-disabled={page <= 1}
          to={pageUrl(
            Math.max(1, page - 1),
          )}
        >
          ← Previous
        </Link>

        <span>
          Page {page} of {pages}
        </span>

        <Link
          aria-disabled={page >= pages}
          to={pageUrl(
            Math.min(pages, page + 1),
          )}
        >
          Next →
        </Link>
      </nav>
    </section>
  );
}
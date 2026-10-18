
import {
  data,
  Form,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction
} from "react-router";

import { CreditCard } from "lucide-react";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import { formatAdminDate } from "../../types/admin-ui";

import {
  PLANS,
  isPlanId,
} from "../../lib/plans";

const SIZE = 20;

const statuses = [
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancelled",
  "completed",
  "expired",
] as const;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Subscriptions — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "subscriptions.read",
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
    url.searchParams.get("status") || "all";

  const status = statuses.some(
    (s) => s === candidate,
  )
    ? candidate
    : "all";

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  let query = db
    .from("subscriptions")
    .select(
      "id,user_id,plan_id,status,razorpay_subscription_id,current_period_end,cancel_at_period_end,created_at",
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

  if (result.error || result.count == null) {
    throw new Response(
      "Subscriptions unavailable.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  const subscriptions = (
    result.data ?? []
  ).map((s) => ({
    ...s,

    pricePaise: isPlanId(s.plan_id)
      ? PLANS[s.plan_id].monthlyPriceInr * 100
      : null,

    verifiedActive:
      s.status === "active" &&
      Boolean(
        s.current_period_end &&
        new Date(s.current_period_end).getTime() >
          Date.now(),
      ),
  }));

  return data(
    {
      subscriptions,
      page,
      total: result.count,
      status,
    },
    { headers: HEADERS },
  );
}

export default function AdminSubscriptions() {
  const {
    subscriptions,
    page,
    total,
    status,
  } = useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  const urlFor = (p: number) =>
    `/admin/subscriptions?${new URLSearchParams({
      page: String(p),
      ...(status !== "all" ? { status } : {}),
    })}`;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <header>
        <p
          style={{
            letterSpacing: 2,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          VERIFIED BILLING RECORDS
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "8px 0",
          }}
        >
          Subscriptions
        </h2>

        <p>
          <CreditCard
            size={17}
            style={{ verticalAlign: "middle" }}
          />{" "}
          Records are read-only here; status
          changes come from Razorpay reconciliation,
          not this dashboard.
        </p>
      </header>

      <Form
        method="get"
        style={{
          display: "flex",
          alignItems: "end",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "grid", gap: 7 }}>
          Provider status

          <select
            name="status"
            defaultValue={status}
            style={{
              padding: 12,
              borderRadius: 10,
            }}
          >
            <option value="all">
              All statuses
            </option>

            {statuses.map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          style={{
            padding: 12,
            background: "#BDF806",
            border: 0,
            borderRadius: 10,
          }}
        >
          Filter
        </button>

        {status !== "all" && (
          <Link to="/admin/subscriptions">
            Clear
          </Link>
        )}
      </Form>

      <section
        style={{
          overflowX: "auto",
          border: "1px solid #dedee3",
          borderRadius: 20,
          background: "white",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 850,
            textAlign: "left",
          }}
        >
          <caption
            style={{
              padding: 18,
              textAlign: "left",
            }}
          >
            {total.toLocaleString("en-IN")} matching
            subscription records
          </caption>

          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {[
                "Subscriber",
                "Plan",
                "Listed monthly price",
                "Provider status",
                "Access status",
                "Period end",
                "Created",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{ padding: 14 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderTop:
                    "1px solid #e8e8ea",
                }}
              >
                <td style={{ padding: 14 }}>
                  <Link
                    to={`/admin/users/${s.user_id}`}
                  >
                    View account
                  </Link>

                  <small
                    style={{
                      display: "block",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {s.user_id}
                  </small>
                </td>

                <td style={{ padding: 14 }}>
                  {isPlanId(s.plan_id)
                    ? PLANS[s.plan_id].name
                    : s.plan_id}
                </td>

                <td style={{ padding: 14 }}>
                  {s.pricePaise == null
                    ? "—"
                    : `₹${(
                        s.pricePaise / 100
                      ).toLocaleString("en-IN")}`}
                </td>

                <td style={{ padding: 14 }}>
                  {s.status}
                  {s.cancel_at_period_end
                    ? " · cancellation scheduled"
                    : ""}
                </td>

                <td style={{ padding: 14 }}>
                  {s.verifiedActive
                    ? "Period valid"
                    : "Not active"}
                </td>

                <td style={{ padding: 14 }}>
                  {formatAdminDate(
                    s.current_period_end,
                  )}
                </td>

                <td style={{ padding: 14 }}>
                  {formatAdminDate(s.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!subscriptions.length && (
          <p style={{ padding: 22 }}>
            No matching subscriptions.
          </p>
        )}
      </section>

      <p
        style={{
          fontSize: 12,
          color: "#5f6067",
        }}
      >
        Listed plan prices are catalog prices,
        not charged amounts. Use Payments/Revenue
        for actual transactions. Valid period alone
        does not prove a feature entitlement.
      </p>

      <nav
        aria-label="Subscription pages"
        style={{
          display: "flex",
          gap: 18,
        }}
      >
        {page > 1 && (
          <Link to={urlFor(page - 1)}>
            ← Previous
          </Link>
        )}

        <span>
          Page {page} / {pages}
        </span>

        {page < pages && (
          <Link to={urlFor(page + 1)}>
            Next →
          </Link>
        )}
      </nav>
    </div>
  );
}
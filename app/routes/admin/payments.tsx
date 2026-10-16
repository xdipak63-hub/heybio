
import {
  Form,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { Wallet } from "lucide-react";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  formatAdminCurrency,
  formatAdminDate,
} from "../../types/admin-ui";

const PAGE_SIZE = 25;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

const statuses = [
  "created",
  "authorized",
  "captured",
  "refunded",
  "failed",
] as const;

export const meta: MetaFunction = () => [
  { title: "Payments — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "payments.read",
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

  const input =
    url.searchParams.get("status") ?? "all";

  const status = statuses.some(
    (s) => s === input,
  )
    ? input
    : "all";

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  let query = db
    .from("payments")
    .select(
      "id,user_id,razorpay_payment_id,amount_paise,amount_refunded_paise,status,currency,captured_at,created_at",
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
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE - 1,
    );

  if (result.error || result.count == null) {
    throw new Response("Payments unavailable.", {
      status: 503,
      headers: HEADERS,
    });
  }

  return Response.json(
    {
      payments: result.data ?? [],
      page,
      total: result.count,
      status,
    },
    { headers: HEADERS },
  );
}

export default function AdminPayments() {
  const {
    payments,
    page,
    total,
    status,
  } = useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  const pageLink = (p: number) =>
    `/admin/payments?${new URLSearchParams({
      page: String(p),
      ...(status !== "all" ? { status } : {}),
    })}`;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <header>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          PAYMENT OPERATIONS
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "8px 0",
          }}
        >
          Payments
        </h2>

        <p>
          <Wallet
            size={17}
            style={{ verticalAlign: "middle" }}
          />{" "}
          Provider-reconciled database records.
          No refund or capture is initiated from
          this page.
        </p>
      </header>

      <Form
        method="get"
        style={{
          display: "flex",
          alignItems: "end",
          gap: 10,
        }}
      >
        <label style={{ display: "grid", gap: 7 }}>
          Status

          <select
            name="status"
            defaultValue={status}
            style={{
              padding: 12,
              borderRadius: 9,
            }}
          >
            <option value="all">All</option>

            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          style={{
            padding: 12,
            borderRadius: 9,
            border: 0,
            background: "#BDF806",
          }}
        >
          Filter
        </button>

        {status !== "all" && (
          <Link to="/admin/payments">
            Reset
          </Link>
        )}
      </Form>

      <section
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #dedee3",
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
              textAlign: "left",
              padding: 18,
            }}
          >
            {total.toLocaleString("en-IN")} matching
            payment records
          </caption>

          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {[
                "Payment ID",
                "Creator",
                "Amount",
                "Refunded",
                "Status",
                "Created",
                "Captured",
              ].map((x) => (
                <th
                  key={x}
                  scope="col"
                  style={{ padding: 14 }}
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderTop:
                    "1px solid #e8e8ea",
                }}
              >
                <td style={{ padding: 14 }}>
                  <code
                    style={{
                      fontSize: 12,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {p.razorpay_payment_id}
                  </code>
                </td>

                <td style={{ padding: 14 }}>
                  <Link
                    to={`/admin/users/${p.user_id}`}
                  >
                    Account
                  </Link>
                </td>

                <td style={{ padding: 14 }}>
                  {p.currency === "INR"
                    ? formatAdminCurrency(
                        p.amount_paise,
                      )
                    : "Unsupported currency"}
                </td>

                <td style={{ padding: 14 }}>
                  {formatAdminCurrency(
                    p.amount_refunded_paise,
                  )}
                </td>

                <td style={{ padding: 14 }}>
                  {p.status}
                </td>

                <td style={{ padding: 14 }}>
                  {formatAdminDate(p.created_at)}
                </td>

                <td style={{ padding: 14 }}>
                  {formatAdminDate(p.captured_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!payments.length && (
          <p style={{ padding: 22 }}>
            No payment records match this filter.
          </p>
        )}
      </section>

      <p
        style={{
          fontSize: 12,
          color: "#5f6067",
        }}
      >
        Do not infer revenue from all payment rows;
        only captured payments (minus refunds) are
        relevant. Provider verification and webhook
        reconciliation must be tested.
      </p>

      <nav
        aria-label="Payment history pages"
        style={{
          display: "flex",
          gap: 18,
        }}
      >
        {page > 1 && (
          <Link to={pageLink(page - 1)}>
            ← Previous
          </Link>
        )}

        <span>
          Page {page} / {pages}
        </span>

        {page < pages && (
          <Link to={pageLink(page + 1)}>
            Next →
          </Link>
        )}
      </nav>
    </div>
  );
}
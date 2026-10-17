
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

import {
  formatAdminCurrency,
  formatAdminDate,
} from "../../types/admin-ui";

const SIZE = 20;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Refunds — HEYBIO Admin" },
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

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(
        new URL(request.url)
          .searchParams.get("page") || "1",
        10,
      ) || 1,
    ),
  );

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const result = await db
    .from("payments")
    .select(
      "id,user_id,razorpay_payment_id,amount_paise,amount_refunded_paise,currency,status,updated_at",
      { count: "exact" },
    )
    .gt("amount_refunded_paise", 0)
    .order("updated_at", { ascending: false })
    .range(
      (page - 1) * SIZE,
      page * SIZE - 1,
    );

  if (result.error || result.count === null) {
    throw new Response(
      "Refund records unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  return Response.json(
    {
      refunds: result.data ?? [],
      total: result.count,
      page,
    },
    { headers: HEADERS },
  );
}

export default function AdminRefunds() {
  const { refunds, total, page } =
    useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          BILLING OPERATIONS
        </p>

        <h2>Refund records</h2>

        <p>
          Verified local payment records with
          a refunded amount. Refund initiation
          is not enabled on this screen.
        </p>
      </header>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>Recorded refunds</strong>

          <span>
            {total.toLocaleString("en-IN")} payments
          </span>
        </div>

        {refunds.length === 0 ? (
          <p className="hb-ops__empty">
            No refunded payments recorded.
          </p>
        ) : (
          <div className="hb-ops__scroll">
            <table className="hb-ops__table">
              <thead>
                <tr>
                  <th scope="col">Payment</th>
                  <th scope="col">Refunded</th>
                  <th scope="col">Payment amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Account</th>
                </tr>
              </thead>

              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td>
                      <code>
                        {refund.razorpay_payment_id}
                      </code>
                    </td>

                    <td>
                      {formatAdminCurrency(
                        refund.amount_refunded_paise,
                      )}
                    </td>

                    <td>
                      {formatAdminCurrency(
                        refund.amount_paise,
                      )}
                    </td>

                    <td>
                      <span className="hb-ops__pill">
                        {refund.amount_refunded_paise ===
                        refund.amount_paise
                          ? "Fully refunded"
                          : "Partially refunded"}
                      </span>
                    </td>

                    <td>
                      {formatAdminDate(
                        refund.updated_at,
                      )}
                    </td>

                    <td>
                      <Link
                        to={`/admin/users/${refund.user_id}`}
                      >
                        View account ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="hb-ops__note">
        Refund execution must use authenticated
        Razorpay APIs, server-side authorization,
        idempotency and reconciliation. Do not
        mark a payment refunded from the browser.
      </p>

      <nav
        className="hb-ops__pager"
        aria-label="Refund pages"
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
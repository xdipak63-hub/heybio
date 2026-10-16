
import {
  Link,
  data,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  ReceiptText,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

const PAGE_SIZE = 10;

export const meta: MetaFunction = () => [
  {
    title: "Payment history — HEYBIO",
  },
  {
    name: "robots",
    content: "noindex, nofollow",
  },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const rawPage =
    new URL(request.url)
      .searchParams.get("page") ?? "1";

  const page = /^\d{1,4}$/.test(rawPage)
    ? Math.max(
        1,
        Math.min(
          1000,
          Number(rawPage),
        ),
      )
    : 1;

  const first =
    (page - 1) * PAGE_SIZE;

  const {
    data: payments,
    count,
    error,
  } = await client.supabase
    .from("payments")
    .select(
      "id,razorpay_payment_id,amount_paise,amount_refunded_paise,currency,status,captured_at,created_at",
      {
        count: "exact",
      },
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .range(
      first,
      first + PAGE_SIZE - 1,
    );

  if (error) {
    throw new Response(
      "Unable to load payment history.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  const total = count ?? 0;

  const pages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  return data(
    {
      payments: payments ?? [],
      page,
      pages,
      total,
    },
    {
      headers: client.headers,
    },
  );
}

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function date(value: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(parsed);
}

export default function PaymentHistory() {
  const {
    payments,
    page,
    pages,
    total,
  } = useLoaderData<typeof loader>();

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container">
        <Link
          className="hb-workspace__back"
          to="/dashboard/billing"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Billing
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              VERIFIED RECORDS
            </span>

            <h1>
              <ReceiptText
                size={29}
                aria-hidden="true"
              />
              Payment history
            </h1>

            <p>
              Only payments linked to your
              authenticated HEYBIO account
              are shown.
            </p>
          </div>
        </header>

        <section
          aria-label="Payment records"
          style={{
            border: "1px solid #DEDEE3",
            borderRadius: 20,
            background: "#FFF",
            overflow: "hidden",
          }}
        >
          {payments.length === 0 ? (
            <div
              style={{
                padding: 32,
              }}
            >
              <h2
                style={{
                  fontSize: 21,
                }}
              >
                No payment records on this page.
              </h2>

              <p
                style={{
                  color: "#5F6067",
                  lineHeight: 1.6,
                }}
              >
                Payments will appear after your
                payment provider confirms them
                and HEYBIO stores the records.
              </p>

              {page > 1 && (
                <Link to="?page=1">
                  View first page
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: 690,
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#F5F5F7",
                    }}
                  >
                    {[
                      "Date",
                      "Payment reference",
                      "Amount",
                      "Refunded",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        style={{
                          padding: "17px 20px",
                          fontSize: 12,
                          letterSpacing: ".04em",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      style={{
                        borderTop:
                          "1px solid #E8E8EA",
                      }}
                    >
                      <td
                        style={{
                          padding: "17px 20px",
                        }}
                      >
                        {date(
                          payment.captured_at ??
                            payment.created_at,
                        )}
                      </td>

                      <td
                        style={{
                          padding: "17px 20px",
                          fontFamily:
                            "ui-monospace, monospace",
                          fontSize: 12,
                        }}
                      >
                        {
                          payment.razorpay_payment_id
                        }
                      </td>

                      <td
                        style={{
                          padding: "17px 20px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {money(
                          payment.amount_paise,
                        )}
                      </td>

                      <td
                        style={{
                          padding: "17px 20px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {money(
                          payment.amount_refunded_paise,
                        )}
                      </td>

                      <td
                        style={{
                          padding: "17px 20px",
                          textTransform: "capitalize",
                        }}
                      >
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <nav
          aria-label="Payment history pages"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#5F6067",
            }}
          >
            {total} records · Page {page} of {pages}
          </span>

          <div className="hb-workspace__actions">
            {page > 1 && (
              <Link
                className="hb-workspace__button"
                to={`?page=${page - 1}`}
              >
                Previous
              </Link>
            )}

            {page < pages && (
              <Link
                className="hb-workspace__button"
                to={`?page=${page + 1}`}
              >
                Next
              </Link>
            )}
          </div>
        </nav>

        <p
          className="hb-workspace__fine"
          style={{
            marginTop: 20,
          }}
        >
          These are internal verified payment
          records, not tax invoices. For
          refunds, failed payments or receipts,{" "}
          <a href="mailto:dipolabs123@gmail.com">
            contact support
          </a>.
        </p>
      </div>
    </main>
  );
}
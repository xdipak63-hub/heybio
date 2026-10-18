
import {
  data,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction
} from "react-router";

import {
  Banknote,
  Receipt,
  Undo2,
} from "lucide-react";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import RevenueChart from "../../components/admin/RevenueChart";
import StatCard from "../../components/admin/StatCard";

import type {
  AdminRevenuePoint,
} from "../../types/admin-ui";

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

const BATCH = 500;
const MAX_ROWS = 20000;

export const meta: MetaFunction = () => [
  { title: "Revenue — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

/**
 * Aggregates verified-source payment records.
 *
 * Fail closed when results cannot be
 * completely retrieved.
 */
export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "revenue.read",
  );

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const now = new Date();

  const monthStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 5,
      1,
    ),
  );

  const periodStart = monthStart.toISOString();
  const periodEnd = now.toISOString();

  const countResult = await db
    .from("payments")
    .select("id", {
      count: "exact",
      head: true,
    })
    .in("status", ["captured", "refunded"])
    .gte("captured_at", periodStart)
    .lte("captured_at", periodEnd);

  if (
    countResult.error ||
    countResult.count == null
  ) {
    throw new Response(
      "Payment totals unavailable.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  if (countResult.count > MAX_ROWS) {
    throw new Response(
      "Payment volume exceeds this read-model limit. Add a protected SQL aggregation RPC before enabling this report.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  type Row = {
    amount_paise: number;
    amount_refunded_paise: number;
    captured_at: string;
  };

  const payments: Row[] = [];

  for (
    let offset = 0;
    offset < countResult.count;
    offset += BATCH
  ) {
    const result = await db
      .from("payments")
      .select(
        "amount_paise,amount_refunded_paise,captured_at",
      )
      .in("status", ["captured", "refunded"])
      .gte("captured_at", periodStart)
      .lte("captured_at", periodEnd)
      .order("captured_at", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      })
      .range(
        offset,
        offset + BATCH - 1,
      );

    if (result.error || !result.data) {
      throw new Response(
        "Payment aggregation failed.",
        {
          status: 503,
          headers: HEADERS,
        },
      );
    }

    payments.push(...(result.data as Row[]));
  }

  if (
    payments.length !== countResult.count
  ) {
    throw new Response(
      "Payment totals changed while loading; please retry.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  const byMonth = new Map<
    string,
    {
      gross: number;
      refunds: number;
    }
  >();

  for (let i = 0; i < 6; i++) {
    const day = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 5 + i,
        1,
      ),
    );

    byMonth.set(
      day.toISOString().slice(0, 7),
      {
        gross: 0,
        refunds: 0,
      },
    );
  }

  for (const payment of payments) {
    const key =
      payment.captured_at.slice(0, 7);

    const bucket = byMonth.get(key);

    if (!bucket) continue;

    bucket.gross += payment.amount_paise;
    bucket.refunds +=
      payment.amount_refunded_paise;
  }

  let gross = 0;
  let refunds = 0;

  const points: AdminRevenuePoint[] = [
    ...byMonth,
  ].map(([key, value]) => {
    gross += value.gross;
    refunds += value.refunds;

    const [year = 1970, month = 1] =
      key.split("-").map(Number);

    return {
      label: new Intl.DateTimeFormat(
        "en-IN",
        {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        },
      ).format(
        new Date(
          Date.UTC(year, month - 1, 1),
        ),
      ),

      amountPaise: Math.max(
        0,
        value.gross - value.refunds,
      ),
    };
  });

  return data(
    {
      points,
      gross,
      refunds,
      net: gross - refunds,
      periodStart,
      periodEnd,
      count: payments.length,
    },
    { headers: HEADERS },
  );
}

export default function AdminRevenue() {
  const {
    points,
    gross,
    refunds,
    net,
    periodStart,
    periodEnd,
    count,
  } = useLoaderData<typeof loader>();

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <header>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          BUSINESS INTELLIGENCE
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "8px 0",
          }}
        >
          Revenue
        </h2>

        <p>
          Captured INR payments less recorded
          refunds. No forecasts, pending charges
          or invented income.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(210px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Gross captured"
          value={gross / 100}
          format="currency"
          icon={<Banknote size={20} />}
          description="Before refunds"
        />

        <StatCard
          label="Refunds recorded"
          value={refunds / 100}
          format="currency"
          icon={<Undo2 size={20} />}
          description="Provider-reconciled refunded paise"
        />

        <StatCard
          label="Net collected"
          value={net / 100}
          format="currency"
          icon={<Receipt size={20} />}
          description="Not net profit or tax income"
        />
      </div>

      <RevenueChart
        data={points}
        title="Net collections · recent six calendar months"
        description="Monthly net captured INR amounts; UTC month boundaries"
      />

      <p
        style={{
          fontSize: 13,
          color: "#5f6067",
        }}
      >
        Based on {count.toLocaleString("en-IN")}{" "}
        captured/refunded records from{" "}
        {periodStart.slice(0, 10)} through{" "}
        {periodEnd.slice(0, 10)} (UTC).
        This is a payments-derived operational
        report, not a tax ledger. Totals may
        change following provider reconciliation
        or refunds.
      </p>
    </div>
  );
}
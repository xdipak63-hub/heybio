
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

const SIZE = 20;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "HYPE DROP access — HEYBIO Admin" },
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

  const subscriptions = await db
    .from("subscriptions")
    .select(
      "id,user_id,plan_id,status,current_period_end,created_at",
      { count: "exact" },
    )
    .in("plan_id", ["premium", "pro_max"])
    .order("created_at", {
      ascending: false,
    })
    .range(
      (page - 1) * SIZE,
      page * SIZE - 1,
    );

  if (
    subscriptions.error ||
    subscriptions.count === null
  ) {
    throw new Response(
      "Subscriptions unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  const list = subscriptions.data ?? [];
  const ids = list.map((item) => item.id);

  const entitlementResult = ids.length
    ? await db
        .from("entitlements")
        .select(
          "subscription_id,starts_at,expires_at,revoked_at",
        )
        .eq("feature_key", "hype_drop")
        .in("subscription_id", ids)
    : {
        data: [],
        error: null,
      };

  if (entitlementResult.error) {
    throw new Response(
      "Entitlement validation unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  const now = Date.now();

  const valid = new Set(
    (entitlementResult.data ?? [])
      .filter(
        (item) =>
          !item.revoked_at &&
          new Date(item.starts_at).getTime() <= now &&
          item.expires_at &&
          new Date(item.expires_at).getTime() > now,
      )
      .map((item) => item.subscription_id),
  );

  const rows = list.map((subscription) => ({
    ...subscription,

    hasAccess:
      subscription.status === "active" &&
      Boolean(
        subscription.current_period_end &&
          new Date(
            subscription.current_period_end,
          ).getTime() > now,
      ) &&
      valid.has(subscription.id),
  }));

  return data(
    {
      rows,
      total: subscriptions.count,
      page,
    },
    { headers: HEADERS },
  );
}

export default function AdminHypeAccess() {
  const { rows, total, page } =
    useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          PREMIUM ENTITLEMENTS
        </p>

        <h2>HYPE DROP access</h2>

        <p>
          Access depends on an active Premium
          or Pro Max subscription and a valid
          entitlement. Free and Pro never qualify.
        </p>
      </header>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>
            Eligible-plan subscriptions
          </strong>

          <span>
            {total.toLocaleString("en-IN")} records
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="hb-ops__empty">
            No Premium or Pro Max subscriptions
            found.
          </p>
        ) : (
          <div className="hb-ops__scroll">
            <table className="hb-ops__table">
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Subscription</th>
                  <th scope="col">Period ends</th>
                  <th scope="col">Entitlement</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>
                      <Link
                        to={`/admin/users/${subscription.user_id}`}
                      >
                        View account ↗
                      </Link>
                    </td>

                    <td>
                      {subscription.plan_id === "pro_max"
                        ? "Pro Max"
                        : "Premium"}
                    </td>

                    <td>
                      {subscription.status}
                    </td>

                    <td>
                      {subscription.current_period_end
                        ? formatAdminDate(
                            subscription.current_period_end,
                          )
                        : "Not available"}
                    </td>

                    <td>
                      <span className="hb-ops__pill">
                        {subscription.hasAccess
                          ? "Active"
                          : "Locked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="hb-ops__note">
        This is a read-only verification view.
        Separate HYPE DROP authentication and
        cross-product entitlement validation
        must still be enforced by the HYPE DROP
        backend.
      </p>

      <nav
        className="hb-ops__pager"
        aria-label="Entitlement pages"
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
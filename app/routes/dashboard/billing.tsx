
import {
  Link,
  data,
  useLoaderData,
  useRevalidator,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  CreditCard,
  History,
  Info,
} from "lucide-react";

import SubscriptionStatus from "../../components/billing/SubscriptionStatus";

import CancelSubscription from "../../components/billing/CancelSubscription";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  getLatestSubscription,
} from "../../lib/payments/subscriptions.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import "../../styles/billing.css";

export const meta: MetaFunction = () => [
  {
    title: "Billing — HEYBIO",
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

  try {
    const admin = createSupabaseAdmin(
      getServerBindings(context),
    );

    const [
      latest,
      entitlement,
    ] = await Promise.all([
      getLatestSubscription(
        admin,
        user.id,
      ),

      getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "hype_drop",
      ),
    ]);

    const { billing } = entitlement;

    return data(
      {
        plan: billing.plan,
        active: billing.active,

        status:
          billing.active
            ? billing.status
            : latest?.status ?? "free",

        currentPeriodEnd:
          billing.currentPeriodEnd,

        cancelAtPeriodEnd:
          latest?.cancel_at_period_end ??
          false,

        hypeDrop: entitlement.allowed,

        canCancel: Boolean(
          latest?.razorpay_subscription_id &&
          latest.status &&
          [
            "active",
            "authenticated",
            "pending",
            "halted",
          ].includes(latest.status) &&
          !latest.cancel_at_period_end,
        ),

        latestPlan:
          latest?.plan_id ?? null,

        latestCreatedAt:
          latest?.created_at ?? null,
      },
      {
        headers: client.headers,
      },
    );
  } catch {
    throw new Response(
      "Billing is temporarily unavailable. No charges were initiated.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(date);
}

export default function BillingPage() {
  const details =
    useLoaderData<typeof loader>();

  const revalidator =
    useRevalidator();

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          to="/dashboard"
          className="hb-workspace__back"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR MEMBERSHIP
            </span>

            <h1>
              <CreditCard
                size={29}
                aria-hidden="true"
              />
              Billing
            </h1>

            <p>
              Review your verified membership
              and recurring billing status.
            </p>
          </div>
        </header>

        <SubscriptionStatus
          plan={details.plan}
          status={details.status}
          active={details.active}
          currentPeriodEnd={
            details.currentPeriodEnd
          }
          cancelAtPeriodEnd={
            details.cancelAtPeriodEnd
          }
          hypeDrop={details.hypeDrop}
          loading={
            revalidator.state === "loading"
          }
        />

        {details.latestPlan &&
          !details.active && (
            <div
              className="hb-workspace__note"
              role="note"
            >
              <Info
                size={19}
                aria-hidden="true"
              />

              <span>
                Your most recent paid subscription
                ({details.latestPlan.replaceAll(
                  "_",
                  " ",
                )}) has status{" "}
                <strong>
                  {details.status}
                </strong>
                . A paid plan unlocks features
                only after verification.
              </span>
            </div>
          )}

        <section
          style={{
            marginTop: 24,
            padding: 24,
            background: "#FFF",
            border: "1px solid #DEDEE3",
            borderRadius: 20,
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 21,
            }}
          >
            Manage your subscription
          </h2>

          <p
            style={{
              lineHeight: 1.65,
              color: "#5F6067",
            }}
          >
            HEYBIO will never upgrade your
            plan based on a browser payment
            callback. Subscription changes
            take effect after provider verification.
          </p>

          {details.latestCreatedAt && (
            <p
              style={{
                fontSize: 13,
              }}
            >
              Latest subscription started:{" "}
              {formatDate(
                details.latestCreatedAt,
              )}
            </p>
          )}

          {details.canCancel ? (
            <CancelSubscription
              onCancelled={() =>
                revalidator.revalidate()
              }
            />
          ) : (
            <p
              style={{
                fontSize: 13,
                color: "#5F6067",
              }}
            >
              No cancellable recurring subscription
              is currently available here.
            </p>
          )}

          <div
            className="hb-workspace__actions"
            style={{
              marginTop: 18,
            }}
          >
            <Link
              className="hb-workspace__button hb-workspace__button--primary"
              to="/pricing"
            >
              Compare plans
            </Link>

            <Link
              className="hb-workspace__button"
              to="/dashboard/payment-history"
            >
              <History
                size={17}
                aria-hidden="true"
              />
              Payment history
            </Link>
          </div>
        </section>

        <p
          className="hb-workspace__fine"
          style={{
            marginTop: 18,
          }}
        >
          New paid checkout is not enabled on
          the public Pricing page yet. For
          billing problems contact{" "}
          <a href="mailto:dipolabs123@gmail.com">
            dipolabs123@gmail.com
          </a>
          . Do not share passwords or OTPs.
        </p>
      </div>
    </main>
  );
}
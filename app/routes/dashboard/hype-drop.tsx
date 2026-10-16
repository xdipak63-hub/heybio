
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
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Rocket,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  PLANS,
} from "../../lib/plans";

export const meta: MetaFunction = () => [
  {
    title: "HYPE DROP access — HEYBIO",
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
    const verified =
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "hype_drop",
      );

    return data(
      {
        plan: verified.billing.plan,
        billingActive:
          verified.billing.active,
        entitled:
          verified.allowed &&
          verified.billing.hypeDrop,
        validUntil:
          verified.billing.currentPeriodEnd,
      },
      {
        headers: client.headers,
      },
    );
  } catch {
    throw new Response(
      "HYPE DROP eligibility could not be verified.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(date);
}

export default function HypeDropPage() {
  const access =
    useLoaderData<typeof loader>();

  const requiresHigherPlan =
    access.plan === "free" ||
    access.plan === "pro";

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
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
              BY DIPO LABS / SEPARATE CREATOR PRODUCT
            </span>

            <h1>
              <Rocket
                size={30}
                aria-hidden="true"
              />
              HYPE DROP
            </h1>

            <p>
              Make Every Launch Feel Legendary.
            </p>
          </div>
        </header>

        <section
          style={{
            background: "#FFF",
            border: "1px solid #DEDEE3",
            borderRadius: 24,
            padding:
              "clamp(24px, 5vw, 42px)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background:
                access.entitled
                  ? "#BDF806"
                  : "#F5F5F7",
              padding: "9px 14px",
              borderRadius: 100,
              fontWeight: 750,
              fontSize: 13,
            }}
          >
            {access.entitled ? (
              <CheckCircle2
                size={17}
                aria-hidden="true"
              />
            ) : (
              <LockKeyhole
                size={17}
                aria-hidden="true"
              />
            )}

            {access.entitled
              ? "Verified plan entitlement"
              : "Access locked"}
          </div>

          <h2
            style={{
              fontSize:
                "clamp(26px, 4vw, 40px)",
              lineHeight: 1.13,
              letterSpacing: "-.045em",
              margin: "26px 0 16px",
            }}
          >
            Your next launch deserves a moment.
          </h2>

          <p
            style={{
              maxWidth: 550,
              lineHeight: 1.75,
              color: "#5F6067",
            }}
          >
            HYPE DROP is a separate DIPO LABS
            application for countdowns and content
            reveals. HEYBIO determines plan
            eligibility, but the separate app
            must independently verify every
            access request.
          </p>

          <div
            className="hb-workspace__note"
            role="status"
            style={{
              marginTop: 22,
            }}
          >
            {access.entitled ? (
              <Clock3
                size={19}
                aria-hidden="true"
              />
            ) : (
              <LockKeyhole
                size={19}
                aria-hidden="true"
              />
            )}

            <span>
              {access.entitled
                ? "Your HEYBIO subscription and entitlement are verified. The secure handoff to the separate HYPE DROP app is not integrated yet; no access link is being issued."
                : requiresHigherPlan
                  ? "HYPE DROP requires a verified Premium or Pro Max subscription. It is not included with Free or Pro."
                  : "Your plan may include HYPE DROP, but its active entitlement could not be confirmed. Check your subscription status."}
            </span>
          </div>

          <p
            style={{
              fontSize: 13,
              marginTop: 22,
            }}
          >
            Current verified HEYBIO plan:{" "}
            <strong>
              {PLANS[access.plan].name}
            </strong>

            {access.entitled &&
            formatDate(access.validUntil)
              ? ` · Access period ends ${formatDate(
                  access.validUntil,
                )}`
              : ""}
          </p>

          <div
            className="hb-workspace__actions"
            style={{
              marginTop: 22,
            }}
          >
            <Link
              className="hb-workspace__button hb-workspace__button--primary"
              to="/dashboard/billing"
            >
              View membership

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

            <Link
              className="hb-workspace__button"
              to="/pricing"
            >
              Compare plans
            </Link>
          </div>
        </section>

        <p
          className="hb-workspace__fine"
          style={{
            marginTop: 20,
          }}
        >
          Eligibility is not an authenticated
          HYPE DROP session. No private HEYBIO
          credentials are shared with another
          app from this page.
        </p>
      </div>
    </main>
  );
}
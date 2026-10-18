
import {
  Link,
  data,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  PLANS,
  type PlanId,
} from "../../lib/plans";

export const meta: MetaFunction = () => [
  {
    title: "HYPE DROP — HEYBIO",
  },
  {
    name: "description",
    content:
      "Discover HYPE DROP, a next-generation launch experience by DIPO LABS.",
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

  const headers = new Headers(client.headers);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0",
  );
  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow",
  );
  headers.set("Vary", "Cookie");

  try {
    const verified =
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "hype_drop",
      );

    const plan = verified.billing.plan;

    const entitled =
      verified.allowed === true &&
      verified.billing.active === true &&
      verified.billing.hypeDrop === true &&
      (
        plan === "premium" ||
        plan === "pro_max"
      );

    return data(
      {
        plan,
        billingActive:
          verified.billing.active,
        entitled,
        validUntil:
          verified.billing.currentPeriodEnd,
        connectionReady: false,
      },
      { headers },
    );
  } catch {
    throw new Response(
      "HYPE DROP eligibility could not be verified.",
      {
        status: 503,
        headers,
      },
    );
  }
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeZone: "UTC",
    },
  ).format(date);
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Rocket;
  title: string;
  description: string;
}) {
  return (
    <article
      style={{
        padding: 22,
        border: "1px solid #E5E5E9",
        borderRadius: 20,
        background: "#FFFFFF",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "#F5F5F7",
          display: "grid",
          placeItems: "center",
          marginBottom: 18,
        }}
      >
        <Icon
          size={21}
          color="#1D1D1F"
          aria-hidden="true"
        />
      </div>

      <h3
        style={{
          margin: "0 0 9px",
          fontSize: 17,
          letterSpacing: "-.025em",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#65656C",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </article>
  );
}

function MembershipCard({
  plan,
  entitled,
  validUntil,
}: {
  plan: PlanId;
  entitled: boolean;
  validUntil: string | null;
}) {
  const expiry = formatDate(validUntil);

  return (
    <aside
      style={{
        padding: 24,
        borderRadius: 22,
        border: "1px solid #E5E5E9",
        background: "#F5F5F7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 16,
          color: "#55555B",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <ShieldCheck
          size={18}
          aria-hidden="true"
        />
        VERIFIED MEMBERSHIP
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <strong
          style={{
            fontSize: 29,
            letterSpacing: "-.05em",
          }}
        >
          {PLANS[plan].name}
        </strong>

        <span
          style={{
            color: "#65656C",
            fontSize: 13,
          }}
        >
          HEYBIO plan
        </span>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#55555B",
          lineHeight: 1.7,
          margin: "14px 0 0",
        }}
      >
        {entitled
          ? "Your active HEYBIO subscription includes HYPE DROP eligibility."
          : "HYPE DROP requires an active Premium or Pro Max membership."}
      </p>

      {entitled && expiry && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: 13,
            marginTop: 18,
          }}
        >
          <CalendarClock
            size={17}
            aria-hidden="true"
          />
          Current access period ends {expiry}
        </div>
      )}

      <Link
        to="/dashboard/billing"
        className="hb-workspace__button"
        style={{
          marginTop: 22,
          display: "inline-flex",
        }}
      >
        Manage membership
        <ArrowUpRight
          size={17}
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}

export default function HypeDropPage() {
  const access =
    useLoaderData<typeof loader>();

  const needsUpgrade =
    access.plan === "free" ||
    access.plan === "pro";

  const statusTitle = access.entitled
    ? "Your membership is eligible"
    : needsUpgrade
      ? "Unlock HYPE DROP"
      : "Access verification required";

  const statusDescription =
    access.entitled
      ? "Your subscription is verified. Secure sign-in to the separate HYPE DROP application is being prepared."
      : needsUpgrade
        ? "Upgrade to Premium or Pro Max to become eligible for HYPE DROP."
        : "Your current membership does not have a verified active HYPE DROP entitlement.";

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Back to dashboard
        </Link>

        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 30,
            padding: "clamp(26px, 6vw, 58px)",
            background: "#FFFFFF",
            border: "1px solid #E5E5E9",
            marginTop: 20,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -70,
              right: -80,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "#BDF806",
              opacity: 0.26,
              filter: "blur(65px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 14px",
                borderRadius: 100,
                background: "#F5F5F7",
                color: "#1D1D1F",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".06em",
              }}
            >
              <Sparkles
                size={15}
                aria-hidden="true"
              />
              A DIPO LABS PRODUCT
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: "#BDF806",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Rocket
                  size={30}
                  color="#1D1D1F"
                  aria-hidden="true"
                />
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#66666D",
                  letterSpacing: ".11em",
                }}
              >
                THE LAUNCH EXPERIENCE
              </span>
            </div>

            <h1
              style={{
                fontSize:
                  "clamp(44px, 8vw, 86px)",
                lineHeight: 0.99,
                letterSpacing: "-.075em",
                margin: "26px 0 16px",
                color: "#1D1D1F",
              }}
            >
              HYPE
              <span
                style={{
                  display: "block",
                }}
              >
                DROP<span style={{
                  color: "#A5D900",
                }}>.</span>
              </span>
            </h1>

            <p
              style={{
                fontSize:
                  "clamp(17px, 2.4vw, 22px)",
                fontWeight: 650,
                letterSpacing: "-.03em",
                margin: "0 0 15px",
              }}
            >
              Make Every Launch Feel Legendary.
            </p>

            <p
              style={{
                maxWidth: 620,
                color: "#65656C",
                lineHeight: 1.8,
                fontSize: 15,
                margin: 0,
              }}
            >
              Build anticipation. Count down to
              the moment. Reveal your next big
              release with a launch experience
              worth remembering.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="access-heading"
          style={{
            marginTop: 24,
            padding:
              "clamp(22px, 4vw, 34px)",
            borderRadius: 24,
            background: "#FFFFFF",
            border: "1px solid #E5E5E9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 15,
                display: "grid",
                placeItems: "center",
                background: access.entitled
                  ? "#BDF806"
                  : "#F5F5F7",
              }}
            >
              {access.entitled ? (
                <CheckCircle2
                  size={23}
                  aria-hidden="true"
                />
              ) : (
                <LockKeyhole
                  size={23}
                  aria-hidden="true"
                />
              )}
            </div>

            <div style={{ flex: "1 1 230px" }}>
              <h2
                id="access-heading"
                style={{
                  fontSize: 23,
                  letterSpacing: "-.04em",
                  margin: "0 0 8px",
                }}
              >
                {statusTitle}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#65656C",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {statusDescription}
              </p>
            </div>
          </div>

          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: "#F5F5F7",
              padding: 17,
              borderRadius: 15,
              marginTop: 22,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <Clock3
              size={19}
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            />

            <span>
              {access.entitled
                ? "Secure HYPE DROP connection is not live yet. Your eligibility is verified, but no access token or external session has been issued."
                : "Access is locked until an eligible subscription and database entitlement are verified."}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            {needsUpgrade ? (
              <Link
                to="/pricing"
                className="hb-workspace__button hb-workspace__button--primary"
              >
                Explore Premium plans
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <Link
                to="/dashboard/billing"
                className="hb-workspace__button hb-workspace__button--primary"
              >
                View subscription
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            )}

            <Link
              to="/dashboard"
              className="hb-workspace__button"
            >
              Return to workspace
            </Link>
          </div>
        </section>

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 14,
          }}
        >
          <FeatureCard
            icon={CalendarClock}
            title="Launch countdowns"
            description="Build excitement around a scheduled release with a dedicated countdown experience."
          />

          <FeatureCard
            icon={Zap}
            title="The big reveal"
            description="Turn the release moment into an experience with a timed surprise reveal."
          />

          <FeatureCard
            icon={Sparkles}
            title="Creator-first design"
            description="Present your music, content, project or product launch with a distinctive visual identity."
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <MembershipCard
            plan={access.plan}
            entitled={access.entitled}
            validUntil={access.validUntil}
          />
        </div>

        <footer
          style={{
            marginTop: 25,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: "#65656C",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          <ShieldCheck
            size={17}
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          />

          <span>
            HYPE DROP is a separate DIPO LABS
            application. HEYBIO membership
            verification does not automatically
            create a HYPE DROP account or
            authenticated session.
          </span>
        </footer>
      </div>
    </main>
  );
}

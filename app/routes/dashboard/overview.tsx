
import {
  Link,
  data,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  Link2,
  LockKeyhole,
  Palette,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  getBillingAccess,
} from "../../lib/payments/subscriptions.server";

import {
  PLANS,
} from "../../lib/plans";

export const meta: MetaFunction = () => [
  {
    title: "Creator Dashboard — HEYBIO",
  },
  {
    name: "description",
    content:
      "Manage your HEYBIO creator profile, links and subscription.",
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
  headers.set("Vary", "Cookie");
  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow",
  );

  const [profile, links, activeLinks] =
    await Promise.all([
      client.supabase
        .from("profiles")
        .select("username,display_name,bio")
        .eq("id", user.id)
        .maybeSingle(),

      client.supabase
        .from("links")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", user.id),

      client.supabase
        .from("links")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", user.id)
        .eq("is_active", true),
    ]);

  if (
    profile.error ||
    links.error ||
    activeLinks.error
  ) {
    throw new Response(
      "Unable to load your creator dashboard.",
      {
        status: 503,
        headers,
      },
    );
  }

  if (!profile.data?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers },
    );
  }

  let billing;

  try {
    const env = getServerBindings(context);
    const admin = createSupabaseAdmin(env);

    billing = await getBillingAccess(
      admin,
      user.id,
    );
  } catch {
    throw new Response(
      "Subscription verification is temporarily unavailable.",
      {
        status: 503,
        headers,
      },
    );
  }

  let hypeDropEligible = false;

  if (
    billing.active &&
    billing.hypeDrop &&
    (
      billing.plan === "premium" ||
      billing.plan === "pro_max"
    )
  ) {
    try {
      const verified =
        await getVerifiedFeatureAccess(
          context,
          client.supabase,
          user.id,
          "hype_drop",
        );

      hypeDropEligible =
        verified.allowed === true &&
        verified.billing.active === true &&
        verified.billing.hypeDrop === true;
    } catch {
      // Fail closed: never display verified
      // access if entitlement RPC fails.
      hypeDropEligible = false;
    }
  }

  return data(
    {
      username: profile.data.username,
      displayName:
        profile.data.display_name ||
        profile.data.username,
      bio: profile.data.bio ?? "",
      totalLinks: links.count ?? 0,
      visibleLinks: activeLinks.count ?? 0,
      plan: billing.plan,
      billingActive: billing.active,
      currentPeriodEnd:
        billing.currentPeriodEnd,
      hypeDropEligible,
    },
    { headers },
  );
}

const TOOLS = [
  {
    to: "/dashboard/links",
    title: "My Links",
    description:
      "Add, organize and publish your links.",
    icon: Link2,
  },
  {
    to: "/dashboard/appearance",
    title: "Appearance",
    description:
      "Customize the look of your creator page.",
    icon: Palette,
  },
  {
    to: "/dashboard/analytics",
    title: "Insights",
    description:
      "Explore analytics available on your plan.",
    icon: BarChart3,
  },
  {
    to: "/dashboard/billing",
    title: "Membership",
    description:
      "Manage your plan and billing information.",
    icon: CreditCard,
  },
  {
    to: "/dashboard/settings",
    title: "Settings",
    description:
      "Manage your creator account preferences.",
    icon: Settings2,
  },
] as const;

function formatDate(
  value: string | null,
): string | null {
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

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Link2;
}) {
  return (
    <article className="hb-dash-overview-stat">
      <div className="hb-dash-overview-stat__top">
        <span>{label}</span>

        <span className="hb-dash-overview-stat__icon">
          <Icon
            size={19}
            aria-hidden="true"
          />
        </span>
      </div>

      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}

export default function DashboardOverview() {
  const {
    username,
    displayName,
    bio,
    totalLinks,
    visibleLinks,
    plan,
    billingActive,
    currentPeriodEnd,
    hypeDropEligible,
  } = useLoaderData<typeof loader>();

  const planName = PLANS[plan].name;
  const periodEnd = formatDate(
    currentPeriodEnd,
  );

  const hasHypePlan =
    plan === "premium" ||
    plan === "pro_max";

  const publicPath =
    `/${encodeURIComponent(username)}`;

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container">
        <section className="hb-overview-hero">
          <div className="hb-overview-hero__copy">
            <span className="hb-workspace__eyebrow">
              YOUR CREATOR SPACE
            </span>

            <h1>
              Hey, {displayName}
              <span aria-hidden="true"> ✳</span>
            </h1>

            <p>
              Your world. One link. Everything
              you need to create, customize
              and grow your HEYBIO.
            </p>

            <div className="hb-overview-hero__actions">
              <Link
                to="/dashboard/links"
                className="hb-workspace__button hb-workspace__button--primary"
              >
                Manage links
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>

              <a
                href={publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="hb-workspace__button"
              >
                View my page
                <ExternalLink
                  size={16}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          <div className="hb-overview-hero__identity">
            <div
              className="hb-overview-hero__avatar"
              aria-hidden="true"
            >
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <strong>@{username}</strong>

            <span>
              {bio
                ? bio.length > 110
                  ? `${bio.slice(0, 107)}…`
                  : bio
                : "Your creator identity starts here."}
            </span>

            <div className="hb-overview-hero__verified">
              <CheckCircle2
                size={15}
                aria-hidden="true"
              />
              Creator page
            </div>
          </div>
        </section>

        <section
          className="hb-overview-section"
          aria-labelledby="overview-heading"
        >
          <div className="hb-overview-section__heading">
            <div>
              <span className="hb-workspace__eyebrow">
                AT A GLANCE
              </span>
              <h2 id="overview-heading">
                Your workspace
              </h2>
            </div>
          </div>

          <div className="hb-dash-overview-stats">
            <StatCard
              label="Total links"
              value={totalLinks}
              description="Links saved in your account."
              icon={Link2}
            />

            <StatCard
              label="Live links"
              value={visibleLinks}
              description="Links enabled for visitors."
              icon={Eye}
            />

            <StatCard
              label="Your plan"
              value={planName}
              description={
                billingActive
                  ? "Active verified membership."
                  : "Current HEYBIO access level."
              }
              icon={ShieldCheck}
            />
          </div>
        </section>

        <section className="hb-overview-membership">
          <div className="hb-overview-membership__icon">
            <CreditCard
              size={23}
              aria-hidden="true"
            />
          </div>

          <div className="hb-overview-membership__copy">
            <span className="hb-workspace__eyebrow">
              MEMBERSHIP
            </span>

            <h2>{planName} plan</h2>

            <p>
              {billingActive
                ? periodEnd
                  ? `Your current paid access period ends ${periodEnd}.`
                  : "Your subscription is active."
                : "Explore HEYBIO plans and features for your creator journey."}
            </p>
          </div>

          <Link
            to="/dashboard/billing"
            className="hb-workspace__button"
          >
            Manage plan
            <ArrowUpRight
              size={16}
              aria-hidden="true"
            />
          </Link>
        </section>

        <section
          className="hb-overview-section"
          aria-labelledby="tools-heading"
        >
          <div className="hb-overview-section__heading">
            <div>
              <span className="hb-workspace__eyebrow">
                CREATOR TOOLS
              </span>
              <h2 id="tools-heading">
                Everything in your hands.
              </h2>
            </div>

            <span className="hb-overview-section__note">
              Built for creators
            </span>
          </div>

          <div className="hb-dash-overview-tools">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="hb-dash-overview-tool"
                >
                  <span className="hb-dash-overview-tool__icon">
                    <Icon
                      size={23}
                      aria-hidden="true"
                    />
                  </span>

                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>

                  <span className="hb-dash-overview-tool__open">
                    Open tool
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="hb-overview-hype">
          <div className="hb-overview-hype__symbol">
            <Rocket
              size={27}
              aria-hidden="true"
            />
          </div>

          <div className="hb-overview-hype__content">
            <span className="hb-overview-hype__eyebrow">
              A DIPO LABS PRODUCT
            </span>

            <h2>HYPE DROP<span>.</span></h2>

            <strong>
              Make Every Launch Feel Legendary.
            </strong>

            <p>
              Countdown to your next release,
              build anticipation and make the
              big reveal unforgettable.
            </p>

            <div className="hb-overview-hype__status">
              {hypeDropEligible ? (
                <>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />
                  Membership eligible
                </>
              ) : (
                <>
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                  />
                  {hasHypePlan
                    ? "Entitlement verification required"
                    : "Premium or Pro Max required"}
                </>
              )}
            </div>

            <div className="hb-overview-hype__notice">
              <Clock3
                size={17}
                aria-hidden="true"
              />
              Secure HYPE DROP sign-in is not
              available yet.
            </div>

            <Link
              to="/dashboard/hype-drop"
              className="hb-overview-hype__link"
            >
              {hypeDropEligible
                ? "View your eligibility"
                : "Explore HYPE DROP"}
              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>

          <Sparkles
            className="hb-overview-hype__decoration"
            size={120}
            strokeWidth={0.8}
            aria-hidden="true"
          />
        </section>
      </div>
    </main>
  );
}

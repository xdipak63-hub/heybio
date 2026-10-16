
import {
  Link,
  data,
  redirect,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  aggregateCreatorAnalytics,
  type AnalyticsPeriod,
} from "../../lib/analytics/aggregation.server";

export const meta: MetaFunction = () => [
  {
    title: "Insights — HEYBIO",
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
    await requireUser(
      request,
      context,
    );

  const {
    data: profile,
    error,
  } = await client.supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Response(
      "Could not open Insights.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      {
        headers: client.headers,
      },
    );
  }

  let allowed = false;

  try {
    allowed = (
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "analytics",
      )
    ).allowed;
  } catch {
    throw new Response(
      "Plan verification unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!allowed) {
    return data(
      {
        allowed: false as const,
        summary: null,
      },
      {
        headers: client.headers,
      },
    );
  }

  const days: AnalyticsPeriod =
    new URL(request.url)
      .searchParams.get("days") === "30"
      ? 30
      : 7;

  try {
    const summary =
      await aggregateCreatorAnalytics(
        client.supabase,
        user.id,
        days,
      );

    return data(
      {
        allowed: true as const,
        summary,
      },
      {
        headers: client.headers,
      },
    );
  } catch {
    throw new Response(
      "Insights temporarily unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }
}

const panel: React.CSSProperties = {
  padding: "clamp(20px, 4vw, 28px)",
  background: "#FFFFFF",
  border: "1px solid #DEDEE3",
  borderRadius: 20,
};

export default function DashboardInsights() {
  const state =
    useLoaderData<typeof loader>();

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
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR PAGE / INSIGHTS
            </span>

            <h1>
              <Activity
                size={30}
                aria-hidden="true"
              />
              Real interactions.
            </h1>

            <p>
              Opt-in profile views and link clicks.
              No invented metrics or visitor identities.
            </p>
          </div>

          <Link
            className="hb-workspace__button"
            to="/dashboard/audience"
          >
            Audience breakdown
            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </header>

        {!state.allowed ? (
          <section style={panel}>
            <ShieldCheck
              size={27}
              aria-hidden="true"
            />

            <h2>
              Insights require Premium or Pro Max.
            </h2>

            <p>
              Verified active subscription and
              analytics entitlement are both required.
            </p>

            <Link
              className="hb-workspace__button hb-workspace__button--primary"
              to="/pricing"
            >
              Compare plans
            </Link>
          </section>
        ) : (
          <>
            <nav
              className="hb-workspace__actions"
              aria-label="Analytics date range"
              style={{
                marginBottom: 20,
              }}
            >
              {[7, 30].map((days) => (
                <Link
                  key={days}
                  to={`?days=${days}`}
                  className={`hb-workspace__button${
                    state.summary.days === days
                      ? " hb-workspace__button--primary"
                      : ""
                  }`}
                  aria-current={
                    state.summary.days === days
                      ? "page"
                      : undefined
                  }
                >
                  Last {days} days
                </Link>
              ))}
            </nav>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,230px),1fr))",
                gap: 14,
              }}
            >
              <div style={panel}>
                <Eye
                  size={23}
                  aria-hidden="true"
                />

                <p style={{ color: "#5F6067" }}>
                  Opt-in page views
                </p>

                <strong
                  style={{
                    fontSize: 38,
                    letterSpacing: "-.05em",
                  }}
                >
                  {state.summary.views.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </div>

              <div style={panel}>
                <MousePointerClick
                  size={23}
                  aria-hidden="true"
                />

                <p style={{ color: "#5F6067" }}>
                  Opt-in link clicks
                </p>

                <strong
                  style={{
                    fontSize: 38,
                    letterSpacing: "-.05em",
                  }}
                >
                  {state.summary.clicks.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </div>

              <div style={panel}>
                <Activity
                  size={23}
                  aria-hidden="true"
                />

                <p style={{ color: "#5F6067" }}>
                  Clicks per 100 measured views
                </p>

                <strong
                  style={{
                    fontSize: 38,
                    letterSpacing: "-.05em",
                  }}
                >
                  {state.summary.clickRate === null
                    ? "—"
                    : state.summary.clickRate}
                </strong>
              </div>
            </div>

            <section
              style={{
                ...panel,
                marginTop: 18,
              }}
              aria-labelledby="trend-heading"
            >
              <h2
                id="trend-heading"
                style={{
                  marginTop: 0,
                }}
              >
                Activity over time
              </h2>

              <p
                style={{
                  color: "#5F6067",
                  fontSize: 14,
                }}
              >
                All dates use UTC. The current period
                includes today's partial results.
              </p>

              {state.summary.views +
                state.summary.clicks ===
              0 ? (
                <div
                  style={{
                    padding: "30px 0",
                    color: "#5F6067",
                  }}
                  role="status"
                >
                  No opt-in events recorded for
                  this period. This is not a count
                  of all visitors.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 17,
                    marginTop: 30,
                  }}
                >
                  {state.summary.buckets.map(
                    (bucket) => {
                      const scale =
                        Math.max(
                          1,
                          ...state.summary.buckets.map(
                            (b) =>
                              Math.max(
                                b.views,
                                b.clicks,
                              ),
                          ),
                        );

                      return (
                        <div
                          key={bucket.from}
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "64px minmax(0,1fr) 96px",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#5F6067",
                            }}
                          >
                            {bucket.label}
                          </span>

                          <div
                            style={{
                              display: "grid",
                              gap: 5,
                            }}
                          >
                            <div
                              title={`${bucket.views} views`}
                              style={{
                                width: `${
                                  (100 *
                                    bucket.views) /
                                  scale
                                }%`,
                                height: 12,
                                borderRadius: 4,
                                background:
                                  "#1D1D1F",
                              }}
                            />

                            <div
                              title={`${bucket.clicks} clicks`}
                              style={{
                                width: `${
                                  (100 *
                                    bucket.clicks) /
                                  scale
                                }%`,
                                height: 12,
                                borderRadius: 4,
                                background:
                                  "#BDF806",
                              }}
                            />
                          </div>

                          <span
                            style={{
                              fontSize: 12,
                              textAlign: "right",
                            }}
                          >
                            {bucket.views} /{" "}
                            {bucket.clicks}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <p
                style={{
                  marginBottom: 0,
                  color: "#5F6067",
                  fontSize: 12,
                }}
              >
                Dark: views · Lime: clicks.
                Numbers are events, not unique people.
              </p>
            </section>

            <p
              className="hb-workspace__fine"
              style={{
                marginTop: 18,
              }}
            >
              Counting requires the visitor's
              optional analytics consent. Bots are
              filtered on a best-effort basis;
              repeated legitimate or abusive
              requests may affect totals until
              edge rate limiting is configured.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
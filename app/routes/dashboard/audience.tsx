
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
  ArrowLeft,
  LockKeyhole,
  MonitorSmartphone,
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
} from "../../lib/analytics/aggregation.server";

export const meta: MetaFunction = () => [
  {
    title: "Audience — HEYBIO",
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
      "Could not open Audience.",
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

  let access:
    Awaited<
      ReturnType<
        typeof getVerifiedFeatureAccess
      >
    >;

  try {
    access =
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "analytics",
      );
  } catch {
    throw new Response(
      "Plan verification unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!access.allowed) {
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

  try {
    const summary =
      await aggregateCreatorAnalytics(
        client.supabase,
        user.id,
        30,
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
      "Audience data temporarily unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }
}

const labels: Record<string, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  tablet: "Tablet",
  unknown: "Unknown",
};

export default function DashboardAudience() {
  const state =
    useLoaderData<typeof loader>();

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard/analytics"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Insights
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              PRIVACY-FIRST MEASUREMENT
            </span>

            <h1>
              <MonitorSmartphone
                size={28}
                aria-hidden="true"
              />
              Audience
            </h1>

            <p>
              Aggregate device categories for
              opted-in profile visits over the
              last 30 days.
            </p>
          </div>
        </header>

        {!state.allowed ? (
          <section className="hb-workspace__note">
            <LockKeyhole
              size={20}
              aria-hidden="true"
            />

            <div>
              <strong>
                Audience insights are locked.
              </strong>

              <p>
                Premium or Pro Max, with a
                verified active analytics
                entitlement, is required.
              </p>

              <Link to="/pricing">
                Compare plans ↗
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section
              style={{
                padding:
                  "clamp(20px,4vw,32px)",
                background: "#FFF",
                border:
                  "1px solid #DEDEE3",
                borderRadius: 22,
              }}
            >
              <span className="hb-workspace__eyebrow">
                RECORDED PROFILE VIEWS · 30 DAYS
              </span>

              <p
                style={{
                  fontSize: 42,
                  fontWeight: 760,
                  margin: "14px 0 30px",
                  letterSpacing: "-.05em",
                }}
              >
                {state.summary.views.toLocaleString(
                  "en-IN",
                )}
              </p>

              <h2
                style={{
                  fontSize: 22,
                }}
              >
                Device categories
              </h2>

              {state.summary.views === 0 ? (
                <p
                  role="status"
                  style={{
                    color: "#5F6067",
                  }}
                >
                  No opt-in audience activity yet.
                  We won't guess who visited.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 20,
                  }}
                >
                  {state.summary.devices.map(
                    ({
                      category,
                      count,
                    }) => {
                      const percentage =
                        state.summary.views > 0
                          ? (100 * count) /
                            state.summary.views
                          : 0;

                      return (
                        <div key={category}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: 14,
                              marginBottom: 8,
                            }}
                          >
                            <strong>
                              {labels[category] ??
                                category}
                            </strong>

                            <span>
                              {count.toLocaleString(
                                "en-IN",
                              )}{" "}
                              ·{" "}
                              {percentage.toFixed(
                                1,
                              )}
                              %
                            </span>
                          </div>

                          <div
                            style={{
                              background:
                                "#F5F5F7",
                              height: 11,
                              borderRadius: 100,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  percentage,
                                )}%`,
                                background:
                                  "#1D1D1F",
                                height: "100%",
                                borderRadius: 100,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <div
              className="hb-workspace__note"
              role="note"
              style={{
                marginTop: 20,
              }}
            >
              <ShieldCheck
                size={20}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Privacy comes first.
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                  }}
                >
                  This screen doesn't identify
                  visitors, show IP addresses,
                  store user-agent strings, or
                  claim unique audience numbers.
                  No country breakdown is shown
                  because the current collection
                  pipeline doesn't collect location.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
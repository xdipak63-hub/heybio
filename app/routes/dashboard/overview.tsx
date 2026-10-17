
import {
  Link,
  data,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Link2,
  Palette,
  Sparkles,
} from "lucide-react";

import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Dashboard — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(
    request,
    context,
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
      "Unable to load your dashboard.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profile.data?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  return data(
    {
      username: profile.data.username,
      displayName:
        profile.data.display_name ||
        profile.data.username,
      totalLinks: links.count ?? 0,
      visibleLinks: activeLinks.count ?? 0,
    },
    { headers: client.headers },
  );
}

const TOOLS = [
  {
    to: "/dashboard/links",
    title: "My Links",
    description:
      "Create, edit and organize your links.",
    icon: Link2,
  },
  {
    to: "/dashboard/appearance",
    title: "Appearance",
    description:
      "Design a page that feels like you.",
    icon: Palette,
  },
  {
    to: "/dashboard/analytics",
    title: "Insights",
    description:
      "Explore performance when available on your plan.",
    icon: BarChart3,
  },
  {
    to: "/dashboard/billing",
    title: "Subscription",
    description:
      "View your verified plan and billing history.",
    icon: CreditCard,
  },
] as const;

export default function DashboardOverview() {
  const {
    username,
    displayName,
    totalLinks,
    visibleLinks,
  } = useLoaderData<typeof loader>();

  return (
    <section className="hb-workspace">
      <div className="hb-workspace__container">
        <div className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR CREATOR SPACE
            </span>

            <h1>
              Hey, {displayName}.
            </h1>

            <p>
              Your page, your content, your world.
              Everything begins here.
            </p>
          </div>

          <div className="hb-workspace__actions">
            <Link
              className="hb-workspace__button hb-workspace__button--primary"
              to="/dashboard/links"
            >
              Manage links
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="hb-dash-overview-stats">
          <article>
            <span>Total links</span>
            <strong>{totalLinks}</strong>
            <p>
              Links saved in your creator account.
            </p>
          </article>

          <article>
            <span>Visible links</span>
            <strong>{visibleLinks}</strong>
            <p>
              Links enabled for public viewing.
            </p>
          </article>

          <article>
            <span>Your HEYBIO</span>
            <strong>@{username}</strong>
            <p>
              Your unique creator username.
            </p>
          </article>
        </div>

        <div className="hb-dash-overview-heading">
          <div>
            <span className="hb-workspace__eyebrow">
              CREATOR TOOLS
            </span>

            <h2>
              Make your page your own.
            </h2>
          </div>
        </div>

        <div className="hb-dash-overview-tools">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                to={tool.to}
                key={tool.to}
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
                  Open tool ↗
                </span>
              </Link>
            );
          })}
        </div>

        <div className="hb-dash-overview-hype">
          <Sparkles size={25} aria-hidden="true" />

          <div>
            <h2>
              HYPE DROP
            </h2>

            <p>
              Make Every Launch Feel Legendary.
              Available with verified Premium
              and Pro Max access.
            </p>
          </div>

          <Link to="/dashboard/hype-drop">
            Explore ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
import {
  Form,
  data,
  redirect,
  useLoaderData
} from "react-router";

import type {
  LoaderFunctionArgs
} from "react-router";

import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Link2,
  Palette,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import {
  requireUser
} from "../../lib/auth/require-user.server";

export function meta() {
  return [
    { title: "Dashboard — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow"
    }
  ];
}

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select(
        "username, display_name, bio, created_at"
      )
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Could not load your dashboard.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers }
    );
  }

  return data(
    {
      email: user.email ?? "",
      username: profile.username,
      displayName:
        profile.display_name ||
        profile.username,
      bio: profile.bio
    },
    { headers: client.headers }
  );
}

const upcomingTools = [
  {
    icon: Link2,
    title: "My Links",
    description:
      "Create, organize and share your content."
  },
  {
    icon: Palette,
    title: "Appearance",
    description:
      "Customize your theme and profile design."
  },
  {
    icon: BarChart3,
    title: "Insights",
    description:
      "Understand your audience and engagement."
  },
  {
    icon: CreditCard,
    title: "Subscription",
    description:
      "Manage your plan and future billing."
  }
];

export default function DashboardOverview() {
  const {
    email,
    username,
    displayName
  } = useLoaderData<typeof loader>();

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a href="/" className="brand">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </a>

        <Form action="/logout" method="post">
          <button
            className="dashboard-logout"
            type="submit"
          >
            Log out
          </button>
        </Form>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <span className="eyebrow">
            YOUR CREATOR SPACE
          </span>

          <h1>
            Hey, {displayName}
            <span> ✳</span>
          </h1>

          <p>
            Welcome to your HEYBIO dashboard.
            Your creator foundation is ready.
          </p>
        </div>

        <div className="dashboard-profile-card">
          <div className="dashboard-profile-card__avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <span>YOUR HEYBIO IDENTITY</span>
            <h2>@{username}</h2>
            <p>{email}</p>
          </div>

          <div className="dashboard-profile-card__badge">
            <ShieldCheck size={17} />
            Verified session
          </div>
        </div>

        <div className="dashboard-section-heading">
          <div>
            <span className="eyebrow">
              YOUR CREATOR TOOLKIT
            </span>

            <h2>
              Everything starts here.
            </h2>
          </div>

          <span className="dashboard-coming">
            MORE TO COME
          </span>
        </div>

        <div className="dashboard-tools">
          {upcomingTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article
                className="dashboard-tool"
                key={tool.title}
              >
                <div className="dashboard-tool__top">
                  <Icon size={27} />
                  <ArrowUpRight size={19} />
                </div>

                <h3>{tool.title}</h3>
                <p>{tool.description}</p>

                <span>
                  In development
                </span>
              </article>
            );
          })}
        </div>

        <div className="dashboard-hype">
          <Sparkles size={31} />

          <div>
            <h3>HYPE DROP</h3>
            <p>
              Access will be connected to verified
              Premium and Pro Max subscriptions
              in the billing phase.
            </p>
          </div>

          <span>COMING SOON</span>
        </div>
      </div>
    </main>
  );
}

import {
  Link,
  data,
  redirect,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
} from "react-router";

import {
  ArrowUpRight,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

export function meta() {
  return [
    { title: "You're ready — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select("username,display_name")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Unable to verify your profile.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  return data(
    {
      username: profile.username,
      displayName:
        profile.display_name ||
        profile.username,
    },
    { headers: client.headers },
  );
}

export default function CompletePage() {
  const { username, displayName } =
    useLoaderData<typeof loader>();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#BDF806",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section
        style={{
          maxWidth: 600,
          width: "100%",
          padding: "56px 36px",
          background: "#FFFFFF",
          borderRadius: 32,
          textAlign: "center",
        }}
      >
        <CheckCircle2
          size={60}
          color="#648900"
          aria-hidden="true"
        />

        <p
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 2,
            marginTop: 24,
          }}
        >
          YOUR SPACE IS READY
        </p>

        <h1
          style={{
            fontSize: "clamp(36px,6vw,58px)",
            letterSpacing: "-.06em",
            lineHeight: 1.05,
          }}
        >
          Welcome to
          <br />
          HEYBIO, {displayName}.
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.7,
          }}
        >
          Your creator identity is set up.
          Add your links and start sharing
          your world.
        </p>

        <div
          style={{
            padding: 18,
            margin: "26px 0",
            borderRadius: 15,
            background: "#F5F5F7",
            fontWeight: 800,
            overflowWrap: "anywhere",
          }}
        >
          /{username}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              padding: "15px 22px",
              borderRadius: 100,
              background: "#1D1D1F",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            to={`/${username}`}
            style={{
              padding: "15px 22px",
              borderRadius: 100,
              background: "#BDF806",
              color: "#1D1D1F",
              textDecoration: "none",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            View profile
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

import { data, Link, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Link2,
} from "lucide-react";

import SharePanel from "../../components/creator/SharePanel";
import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Share your page — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select("username,account_status")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response("Could not check your public page.", {
      status: 503,
      headers: client.headers,
    });
  }

  if (!profile?.username) {
    throw redirect("/onboarding/choose-username", {
      headers: client.headers,
    });
  }

  // The existing public-profile RPC exposes active
  // profiles with an assigned username.
  // No separate publication column exists yet.
  const publiclyAccessible =
    profile.account_status === "active";

  const origin = new URL(request.url).origin;

  const profileUrl =
    `${origin}/${encodeURIComponent(profile.username)}`;

  return data(
    {
      username: profile.username,
      profileUrl,
      publiclyAccessible,
    },
    { headers: client.headers },
  );
}

export default function DashboardShare() {
  const {
    username,
    profileUrl,
    publiclyAccessible,
  } = useLoaderData<typeof loader>();

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Dashboard
        </Link>

        <div className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              ONE LINK. EVERYWHERE.
            </span>

            <h1>
              <Link2 size={31} aria-hidden="true" />
              Share your world
            </h1>

            <p>
              Make it easy for people to find your
              links and latest work.
            </p>
          </div>
        </div>

        <div
          className="hb-workspace__status"
          role="status"
        >
          {publiclyAccessible ? (
            <CheckCircle2
              size={18}
              aria-hidden="true"
            />
          ) : (
            <CircleAlert
              size={18}
              aria-hidden="true"
            />
          )}

          <span>
            {publiclyAccessible
              ? "Your active HEYBIO profile can be opened using its public URL."
              : "Your account is not currently available as a public profile."}
          </span>
        </div>

        <SharePanel
          username={username}
          profileUrl={profileUrl}
          published={publiclyAccessible}
        />

        <p className="hb-workspace__fine">
          Your page follows the current public-profile
          settings. A separate publish/unpublish control
          is not implemented in this database schema yet.
        </p>
      </div>
    </main>
  );
}


import { data, Link, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ArrowLeft, ExternalLink, Eye, Info } from "lucide-react";

import ProfilePreview from "../../components/creator/ProfilePreview";
import type {
  PreviewProfile,
  PublicLink,
} from "../../components/creator/ProfilePreview";

import {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS,
} from "../../components/creator/ThemePicker";
import type {
  ProfileTheme,
} from "../../components/creator/ThemePicker";

import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Preview your page — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const [profileResult, themeResult, linksResult] =
    await Promise.all([
      client.supabase
        .from("profiles")
        .select("username,display_name,bio")
        .eq("id", user.id)
        .maybeSingle(),

      client.supabase
        .from("profile_themes")
        .select("preset,accent,button_style")
        .eq("profile_id", user.id)
        .maybeSingle(),

      client.supabase
        .from("links")
        .select("id,title,url,description")
        .eq("profile_id", user.id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  if (
    profileResult.error ||
    themeResult.error ||
    linksResult.error
  ) {
    throw new Response("Could not load your preview.", {
      status: 503,
      headers: client.headers,
    });
  }

  const profile = profileResult.data;

  if (!profile?.username) {
    throw redirect("/onboarding/choose-username", {
      headers: client.headers,
    });
  }

  const stored = themeResult.data;

  const theme: ProfileTheme = {
    preset:
      THEME_PRESETS.find(
        (item) => item.id === stored?.preset,
      )?.id ?? "classic",

    accent:
      ACCENT_COLORS.find(
        (color) => color === stored?.accent,
      ) ?? "#BDF806",

    buttonStyle:
      BUTTON_STYLES.find(
        (item) => item.id === stored?.button_style,
      )?.id ?? "rounded",
  };

  const preview: PreviewProfile = {
    username: profile.username,
    displayName:
      profile.display_name || profile.username,
    bio: profile.bio || "",
    theme,

    links: (linksResult.data ?? []).map(
      (link): PublicLink => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description || "",
      }),
    ),
  };

  return data(
    { preview },
    { headers: client.headers },
  );
}

export default function DashboardPreview() {
  const { preview } = useLoaderData<typeof loader>();

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container">
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
              YOUR CREATOR PAGE
            </span>

            <h1>
              <Eye size={31} aria-hidden="true" />
              Page preview
            </h1>

            <p>
              See your current saved profile and
              active links as a visitor would.
            </p>
          </div>

          <div className="hb-workspace__actions">
            <Link
              className="hb-workspace__button"
              to="/dashboard/appearance"
            >
              Edit appearance
            </Link>

            <a
              className="hb-workspace__button hb-workspace__button--primary"
              href={`/${encodeURIComponent(preview.username)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open public page
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="hb-workspace__note" role="note">
          <Info size={18} aria-hidden="true" />
          This preview shows your saved theme and active
          links. Avatar and social links will be added
          when the preview component supports them.
        </div>

        <div className="hb-workspace__preview">
          <ProfilePreview profile={preview} />
        </div>
      </div>
    </main>
  );
}

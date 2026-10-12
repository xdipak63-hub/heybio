
import {
  data,
  Link,
  useLoaderData
} from "react-router";

import type {
  LoaderFunctionArgs
} from "react-router";

import {
  createSupabaseServer
} from "../../lib/supabase/server";

import {
  safePublicUsername,
  normalizeExternalUrl
} from "../../lib/security/safe-redirect";

import ProfilePreview from "../../components/creator/ProfilePreview";

import type {
  PreviewProfile
} from "../../components/creator/ProfilePreview";

import {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS
} from "../../components/creator/ThemePicker";

import type {
  ProfileTheme
} from "../../components/creator/ThemePicker";

type PublicProfileRecord = {
  username: string;
  displayName: string;
  bio: string;
  theme: {
    preset: string;
    accent: string;
    buttonStyle: string;
  };
  links: {
    id: string;
    title: string;
    url: string;
    description: string;
  }[];
};

function isPublicProfile(
  value: unknown
): value is PublicProfileRecord {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<PublicProfileRecord>;

  return (
    typeof candidate.username === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.bio === "string" &&
    typeof candidate.theme === "object" &&
    candidate.theme !== null &&
    Array.isArray(candidate.links)
  );
}

function verifiedTheme(
  raw: PublicProfileRecord["theme"]
): ProfileTheme {
  const preset = THEME_PRESETS.find(
    (item) => item.id === raw.preset
  )?.id ?? "classic";

  const accent = ACCENT_COLORS.find(
    (item) => item === raw.accent
  ) ?? "#BDF806";

  const buttonStyle = BUTTON_STYLES.find(
    (item) => item.id === raw.buttonStyle
  )?.id ?? "rounded";

  return {
    preset,
    accent,
    buttonStyle
  };
}

export async function loader({
  request,
  context,
  params
}: LoaderFunctionArgs) {
  const username = String(
    params.username ?? ""
  ).toLowerCase();

  if (!safePublicUsername(username)) {
    throw new Response(
      "Profile not found.",
      { status: 404 }
    );
  }

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const { data: profile, error } =
    await supabase.rpc(
      "get_public_profile",
      { p_username: username }
    );

  if (error) {
    throw new Response(
      "Unable to load profile.",
      {
        status: 503,
        headers
      }
    );
  }

  if (!isPublicProfile(profile)) {
    throw new Response(
      "Profile not found.",
      {
        status: 404,
        headers
      }
    );
  }

  const safeLinks = profile.links
    .filter(
      (link) =>
        link &&
        typeof link.id === "string" &&
        typeof link.title === "string" &&
        typeof link.url === "string" &&
        typeof link.description === "string"
    )
    .map((link) => ({
      ...link,
      url: normalizeExternalUrl(link.url)
    }))
    .filter(
      (link): link is typeof link & { url: string } =>
        link.url !== null
    );

  const result: PreviewProfile = {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    theme: verifiedTheme(profile.theme),
    links: safeLinks
  };

  return data(
    { profile: result },
    { headers }
  );
}

export function meta({
  data: routeData
}: {
  data?: { profile: PreviewProfile };
}) {
  const profile = routeData?.profile;

  if (!profile) {
    return [
      { title: "Profile not found — HEYBIO" },
      { name: "robots", content: "noindex" }
    ];
  }

  const name =
    profile.displayName || profile.username;

  return [
    {
      title: `${name} (@${profile.username}) — HEYBIO`
    },
    {
      name: "description",
      content:
        profile.bio ||
        `Explore ${name}'s world on HEYBIO.`
    },
    {
      property: "og:title",
      content: `${name} on HEYBIO`
    },
    {
      property: "og:description",
      content:
        profile.bio ||
        `Discover ${name}'s links and content.`
    },
    {
      property: "og:type",
      content: "profile"
    }
  ];
}

export default function PublicProfilePage() {
  const { profile } =
    useLoaderData<typeof loader>();

  return (
    <main className="public-profile-page">
      <div className="public-profile-page__top">
        <Link
          className="brand"
          to="/"
          aria-label="HEYBIO homepage"
        >
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>
      </div>

      <ProfilePreview profile={profile} />
    </main>
  );
}

import {
  data,
  Link,
  useLoaderData,
  type LoaderFunctionArgs
} from "react-router";

import { ArrowLeft, Share2 } from "lucide-react";

import {
  createSupabaseServer
} from "../../lib/supabase/server";

import ProfilePreview, {
  type PreviewProfile
} from "../../components/creator/ProfilePreview";

import {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS,
  type ProfileTheme
} from "../../components/creator/ThemePicker";

import "./public-profile.css";

type RawLink = {
  id: unknown;
  title: unknown;
  url: unknown;
  description?: unknown;
};

type RawProfile = {
  username?: unknown;
  displayName?: unknown;
  bio?: unknown;
  theme?: {
    preset?: unknown;
    accent?: unknown;
    buttonStyle?: unknown;
  };
  links?: unknown;
};

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;

function safeUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const input = value.trim();

  if (
    !input ||
    input.length > 2048 ||
    /[\u0000-\u001F\u007F\\]/.test(input)
  ) {
    return null;
  }

  try {
    const url = new URL(input);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    if (url.username || url.password) return null;

    return url.href;
  } catch {
    return null;
  }
}

function safeText(
  value: unknown,
  maxLength: number
): string {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function resolveTheme(
  raw: RawProfile["theme"]
): ProfileTheme {
  const preset =
    THEME_PRESETS.find(
      (item) => item.id === raw?.preset
    )?.id ?? "classic";

  const accent =
    ACCENT_COLORS.find(
      (item) => item === raw?.accent
    ) ?? "#BDF806";

  const buttonStyle =
    BUTTON_STYLES.find(
      (item) => item.id === raw?.buttonStyle
    )?.id ?? "rounded";

  return {
    preset,
    accent,
    buttonStyle
  };
}

function resolveProfile(
  value: unknown,
  requestedUsername: string
): PreviewProfile | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const raw = value as RawProfile;
  const username = safeText(raw.username, 30).toLowerCase();

  if (
    !safeUsername(username) ||
    username !== requestedUsername
  ) {
    return null;
  }

  const rawLinks = Array.isArray(raw.links)
    ? raw.links
    : [];

  const links = rawLinks
    .slice(0, 250)
    .flatMap((entry: unknown) => {
      if (!entry || typeof entry !== "object") return [];

      const link = entry as RawLink;
      const id = safeText(link.id, 100);
      const title = safeText(link.title, 160);
      const url = safeExternalUrl(link.url);

      if (!id || !title || !url) return [];

      return [{
        id,
        title,
        url,
        description: safeText(link.description, 300)
      }];
    });

  return {
    username,
    displayName: safeText(raw.displayName, 100) || username,
    bio: safeText(raw.bio, 500),
    theme: resolveTheme(raw.theme),
    links
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

  if (!safeUsername(username)) {
    throw new Response("Profile not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const { data: record, error } = await supabase.rpc(
    "get_public_profile",
    { p_username: username }
  );

  if (error) {
    console.error("Public profile lookup failed", {
      code: error.code
    });

    throw new Response("Profile temporarily unavailable", {
      status: 503,
      headers: {
        ...Object.fromEntries(headers.entries()),
        "Cache-Control": "no-store"
      }
    });
  }

  const profile = resolveProfile(record, username);

  if (!profile) {
    throw new Response("Profile not found", {
      status: 404,
      headers: {
        ...Object.fromEntries(headers.entries()),
        "Cache-Control": "no-store"
      }
    });
  }

  headers.set("Cache-Control", "private, no-store");

  return data({ profile }, { headers });
}

export function meta({
  data: routeData
}: {
  data?: { profile: PreviewProfile };
}) {
  const profile = routeData?.profile;

  if (!profile) {
    return [
      { title: "Profile unavailable — HEYBIO" },
      { name: "robots", content: "noindex" }
    ];
  }

  const title =
    `${profile.displayName} (@${profile.username}) — HEYBIO`;

  const description =
    profile.bio ||
    `Discover ${profile.displayName}'s links on HEYBIO.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "profile" }
  ];
}

export default function PublicProfilePage() {
  const { profile } = useLoaderData<typeof loader>();

  async function shareProfile() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} on HEYBIO`,
          url
        });
      } catch {
        // The visitor may cancel the native share sheet.
      }
      return;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        window.alert("Profile link copied.");
      } catch {
        window.prompt("Copy profile link:", url);
      }
      return;
    }

    window.prompt("Copy profile link:", url);
  }

  return (
    <main className="hb-public-page">
      <header className="hb-public-page__header">
        <Link
          to="/"
          className="hb-public-page__brand"
          aria-label="HEYBIO homepage"
        >
          HEYBIO <span aria-hidden="true">↗</span>
        </Link>

        <div className="hb-public-page__header-actions">
          <button
            type="button"
            className="hb-public-page__share"
            onClick={() => void shareProfile()}
          >
            <Share2 size={17} aria-hidden="true" />
            <span>Share</span>
          </button>
        </div>
      </header>

      <section
        className="hb-public-page__content"
        aria-label={`${profile.displayName}'s public profile`}
      >
        <ProfilePreview profile={profile} />
      </section>

      <footer className="hb-public-page__footer">
        <Link to="/">
          <ArrowLeft size={15} aria-hidden="true" />
          Discover HEYBIO
        </Link>
        <span>Your world. One link.</span>
      </footer>
    </main>
  );
}

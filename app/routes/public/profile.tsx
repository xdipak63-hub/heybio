
import {
  data,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";

import {
  ArrowLeft,
  Share2,
} from "lucide-react";

import {
  createSupabaseServer,
} from "../../lib/supabase/server";

import ProfilePreview, {
  type PreviewProfile,
  type PublicSocialLink,
} from "../../components/creator/ProfilePreview";

import {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS,
  type ProfileTheme,
} from "../../components/creator/ThemePicker";

import "./public-profile.css";

const USERNAME =
  /^[a-z][a-z0-9_]{2,29}$/;

const PLATFORMS = new Set([
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "x",
  "linkedin",
  "github",
  "threads",
  "pinterest",
  "snapchat",
  "twitch",
  "website",
]);

type RawProfile = {
  username?: unknown;
  displayName?: unknown;
  bio?: unknown;
  hasAvatar?: unknown;
  theme?: {
    preset?: unknown;
    accent?: unknown;
    buttonStyle?: unknown;
  };
  links?: unknown;
  socialLinks?: unknown;
};

function safeText(
  input: unknown,
  limit: number,
): string {
  return typeof input === "string"
    ? input.trim().slice(0, limit)
    : "";
}

function safeUrl(
  input: unknown,
  requireHttps = false,
): string | null {
  if (typeof input !== "string") {
    return null;
  }

  if (
    input.length > 2048 ||
    /[\u0000-\u001f\u007f\\]/.test(
      input,
    )
  ) {
    return null;
  }

  try {
    const url = new URL(input);

    if (
      url.protocol !== "https:" &&
      (requireHttps ||
        url.protocol !== "http:")
    ) {
      return null;
    }

    if (
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function safeTheme(
  raw: RawProfile["theme"],
): ProfileTheme {
  return {
    preset:
      THEME_PRESETS.find(
        (item) => item.id === raw?.preset,
      )?.id ?? "classic",

    accent:
      ACCENT_COLORS.find(
        (item) => item === raw?.accent,
      ) ?? "#BDF806",

    buttonStyle:
      BUTTON_STYLES.find(
        (item) =>
          item.id === raw?.buttonStyle,
      )?.id ?? "rounded",
  };
}

function parseProfile(
  record: unknown,
  requested: string,
): PreviewProfile | null {
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    return null;
  }

  const raw = record as RawProfile;

  const username = safeText(
    raw.username,
    30,
  ).toLowerCase();

  if (
    !USERNAME.test(username) ||
    username !== requested
  ) {
    return null;
  }

  const links = (
    Array.isArray(raw.links)
      ? raw.links.slice(0, 250)
      : []
  ).flatMap((entry: unknown) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry)
    ) {
      return [];
    }

    const value =
      entry as Record<string, unknown>;

    const id = safeText(
      value.id,
      100,
    );

    const title = safeText(
      value.title,
      100,
    );

    const url = safeUrl(value.url);

    if (!id || !title || !url) {
      return [];
    }

    return [{
      id,
      title,
      url,
      description: safeText(
        value.description,
        200,
      ),
    }];
  });

  const socialLinks: PublicSocialLink[] = (
    Array.isArray(raw.socialLinks)
      ? raw.socialLinks.slice(0, 12)
      : []
  ).flatMap((entry: unknown) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry)
    ) {
      return [];
    }

    const value =
      entry as Record<string, unknown>;

    const platform = safeText(
      value.platform,
      40,
    );

    const url = safeUrl(
      value.url,
      true,
    );

    if (
      !PLATFORMS.has(platform) ||
      !url
    ) {
      return [];
    }

    return [{
      platform,
      url,
    }];
  });

  return {
    username,
    displayName:
      safeText(
        raw.displayName,
        80,
      ) || username,

    bio: safeText(
      raw.bio,
      500,
    ),

    avatarUrl:
      raw.hasAvatar === true
        ? `/api/public-avatar/${encodeURIComponent(username)}`
        : null,

    theme: safeTheme(raw.theme),
    links,
    socialLinks,
  };
}

export async function loader({
  request,
  context,
  params,
}: LoaderFunctionArgs) {
  const username = String(
    params.username ?? "",
  ).toLowerCase();

  if (!USERNAME.test(username)) {
    throw new Response(
      "Profile not found.",
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const { supabase, headers } =
    createSupabaseServer(
      request,
      context,
    );

  const { data: record, error } =
    await supabase.rpc(
      "get_public_profile",
      { p_username: username },
    );

  if (error) {
    console.error(
      "Public profile lookup failed",
      { code: error.code },
    );

    throw new Response(
      "Profile temporarily unavailable.",
      {
        status: 503,
        headers,
      },
    );
  }

  const profile = parseProfile(
    record,
    username,
  );

  if (!profile) {
    throw new Response(
      "Profile not found.",
      {
        status: 404,
        headers,
      },
    );
  }

  headers.set(
    "Cache-Control",
    "private, no-store",
  );

  return data(
    { profile },
    { headers },
  );
}

export function meta({
  data: routeData,
}: {
  data?: {
    profile: PreviewProfile;
  };
}) {
  const profile = routeData?.profile;

  if (!profile) {
    return [
      {
        title:
          "Profile unavailable — HEYBIO",
      },
    ];
  }

  const title =
    `${profile.displayName} (@${profile.username}) — HEYBIO`;

  const description =
    profile.bio ||
    `Discover ${profile.displayName}'s world on HEYBIO.`;

  return [
    { title },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:type",
      content: "profile",
    },
  ];
}

export default function PublicProfilePage() {
  const { profile } =
    useLoaderData<typeof loader>();

  async function shareProfile() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title:
            `${profile.displayName} on HEYBIO`,
          url,
        });
      } catch {
        // Dismissal is not an error.
      }

      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          url,
        );
        window.alert(
          "Profile link copied.",
        );
        return;
      } catch {
        // Provide manual copy fallback.
      }
    }

    window.prompt(
      "Copy profile link:",
      url,
    );
  }

  return (
    <main className="hb-public-page">
      <header className="hb-public-page__header">
        <Link
          to="/"
          className="hb-public-page__brand"
          aria-label="HEYBIO homepage"
        >
          HEYBIO{" "}
          <span aria-hidden="true">↗</span>
        </Link>

        <div className="hb-public-page__header-actions">
          <button
            type="button"
            className="hb-public-page__share"
            onClick={() =>
              void shareProfile()
            }
          >
            <Share2
              size={17}
              aria-hidden="true"
            />
            Share
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
          <ArrowLeft
            size={15}
            aria-hidden="true"
          />
          Discover HEYBIO
        </Link>

        <span>
          Your world. One link.
        </span>
      </footer>
    </main>
  );
}
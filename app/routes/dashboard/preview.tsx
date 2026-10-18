
import {
  data,
  Link,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Info,
  Link2,
  Palette,
  Share2,
} from "lucide-react";

import ProfilePreview from "../../components/creator/ProfilePreview";

import type {
  PreviewProfile,
  PublicLink,
  PublicSocialLink,
} from "../../components/creator/ProfilePreview";

import {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS,
  type ProfileTheme,
} from "../../components/creator/ThemePicker";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  {
    title: "Preview your page — HEYBIO",
  },
  {
    name: "robots",
    content: "noindex, nofollow",
  },
];

const ALLOWED_PLATFORMS = new Set([
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

function safeSocialUrl(
  value: string,
): string | null {
  if (
    value.length > 2048 ||
    /[\u0000-\u001f\u007f\\]/.test(value)
  ) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
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

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const [
    profileResult,
    themeResult,
    linksResult,
    socialResult,
    avatarResult,
  ] = await Promise.all([
    client.supabase
      .from("profiles")
      .select(
        "username,display_name,bio",
      )
      .eq("id", user.id)
      .maybeSingle(),

    client.supabase
      .from("profile_themes")
      .select(
        "preset,accent,button_style",
      )
      .eq("profile_id", user.id)
      .maybeSingle(),

    client.supabase
      .from("links")
      .select(
        "id,title,url,description",
      )
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .order("position", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    client.supabase
      .from("social_links")
      .select("platform,url")
      .eq("user_id", user.id)
      .eq("is_visible", true)
      .order("position", {
        ascending: true,
      }),

    client.supabase
      .from("profile_media")
      .select("id")
      .eq("user_id", user.id)
      .eq("media_type", "avatar")
      .maybeSingle(),
  ]);

  if (
    profileResult.error ||
    themeResult.error ||
    linksResult.error ||
    socialResult.error ||
    avatarResult.error
  ) {
    throw new Response(
      "Could not load your page preview.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  const profile = profileResult.data;

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      {
        headers: client.headers,
      },
    );
  }

  const stored = themeResult.data;

  const theme: ProfileTheme = {
    preset:
      THEME_PRESETS.find(
        (item) =>
          item.id === stored?.preset,
      )?.id ?? "classic",

    accent:
      ACCENT_COLORS.find(
        (color) =>
          color === stored?.accent,
      ) ?? "#BDF806",

    buttonStyle:
      BUTTON_STYLES.find(
        (item) =>
          item.id === stored?.button_style,
      )?.id ?? "rounded",
  };

  const socialLinks: PublicSocialLink[] =
    (socialResult.data ?? [])
      .filter(
        (social) =>
          ALLOWED_PLATFORMS.has(
            social.platform,
          ),
      )
      .map((social) => {
        const url = safeSocialUrl(
          social.url,
        );

        if (!url) return null;

        return {
          platform: social.platform,
          url,
        };
      })
      .filter(
        (
          item,
        ): item is PublicSocialLink =>
          item !== null,
      )
      .slice(0, 12);

  const links: PublicLink[] =
    (linksResult.data ?? []).map(
      (link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description:
          link.description || "",
      }),
    );

  const preview: PreviewProfile = {
    username: profile.username,
    displayName:
      profile.display_name ||
      profile.username,
    bio: profile.bio || "",
    theme,
    links,
    socialLinks,

    avatarUrl: avatarResult.data
      ? `/api/public-avatar/${encodeURIComponent(
          profile.username,
        )}`
      : null,
  };

  const headers = new Headers(
    client.headers,
  );

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0",
  );

  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow",
  );

  headers.set("Vary", "Cookie");

  return data(
    {
      preview,
      stats: {
        activeLinks: links.length,
        socialLinks: socialLinks.length,
        hasAvatar:
          Boolean(avatarResult.data),
      },
    },
    { headers },
  );
}

export default function DashboardPreview() {
  const { preview, stats } =
    useLoaderData<typeof loader>();

  const publicPath =
    `/${encodeURIComponent(
      preview.username,
    )}`;

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

        <div className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR CREATOR PAGE
            </span>

            <h1>
              <Eye
                size={31}
                aria-hidden="true"
              />
              Page preview
            </h1>

            <p>
              See your saved profile,
              avatar, social links,
              appearance and active links
              in one place.
            </p>
          </div>

          <div className="hb-workspace__actions">
            <Link
              className="hb-workspace__button"
              to="/dashboard/appearance"
            >
              <Palette
                size={16}
                aria-hidden="true"
              />
              Edit appearance
            </Link>

            <a
              className="hb-workspace__button hb-workspace__button--primary"
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open public page
              <ExternalLink
                size={16}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div
          className="hb-workspace__note"
          role="note"
        >
          <Info
            size={18}
            aria-hidden="true"
          />
          This preview uses your saved
          data. Only enabled links and
          visible social accounts appear.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            margin: "20px 0 24px",
          }}
        >
          {[
            {
              label: "Active links",
              value: stats.activeLinks,
              icon: Link2,
            },
            {
              label: "Social accounts",
              value: stats.socialLinks,
              icon: Share2,
            },
            {
              label: "Profile image",
              value: stats.hasAvatar
                ? "Added"
                : "Not added",
              icon: ImageIcon,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                style={{
                  background: "#FFFFFF",
                  border:
                    "1px solid #E5E5E9",
                  borderRadius: 18,
                  padding: 18,
                  minWidth: 0,
                }}
              >
                <Icon
                  size={20}
                  aria-hidden="true"
                />

                <strong
                  style={{
                    display: "block",
                    marginTop: 12,
                    fontSize: 23,
                    color: "#1D1D1F",
                  }}
                >
                  {item.value}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: 5,
                    color: "#686971",
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="hb-workspace__preview">
          <ProfilePreview
            profile={preview}
          />
        </div>
      </div>
    </main>
  );
}

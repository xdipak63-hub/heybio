
import {
  useEffect,
  useRef,
  type CSSProperties,
} from "react";

import {
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

import type {
  ProfileTheme,
} from "./ThemePicker";

import {
  readCookiePreferences,
} from "../shared/CookieConsent";

import "./profile-preview-media.css";

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  description: string;
};

export type PublicSocialLink = {
  platform: string;
  url: string;
};

export type PreviewProfile = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
  theme: ProfileTheme;
  links: PublicLink[];
  socialLinks?: PublicSocialLink[];
};

type Props = {
  profile: PreviewProfile;
  compact?: boolean;
};

const THEMES: Record<
  ProfileTheme["preset"],
  {
    background: string;
    text: string;
  }
> = {
  classic: {
    background: "#F9F9F6",
    text: "#1A1B19",
  },
  midnight: {
    background: "#171817",
    text: "#FFFFFF",
  },
  ice: {
    background: "#D9EEFF",
    text: "#152A40",
  },
  peach: {
    background: "#FFE0D5",
    text: "#3D2520",
  },
  lavender: {
    background: "#EDE3FF",
    text: "#302044",
  },
  minimal: {
    background: "#FFFFFF",
    text: "#161616",
  },
};

function isPublicRoute(
  username: string,
): boolean {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  return (
    window.location.pathname.replace(
      /\/$/,
      "",
    ) ===
    `/${encodeURIComponent(username)}`
  );
}

function emitAnalytics(
  username: string,
  event:
    | "profile_view"
    | "link_click",
  linkId: string | null = null,
): void {
  if (
    !isPublicRoute(username) ||
    readCookiePreferences()?.analytics !== true
  ) {
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    credentials: "omit",

    headers: {
      "Content-Type": "application/json",
    },

    keepalive: true,

    body: JSON.stringify({
      username,
      event,
      linkId,
    }),
  }).catch(() => undefined);
}

function socialLabel(
  platform: string,
): string {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    tiktok: "TikTok",
    facebook: "Facebook",
    x: "X",
    linkedin: "LinkedIn",
    github: "GitHub",
    threads: "Threads",
    pinterest: "Pinterest",
    snapchat: "Snapchat",
    twitch: "Twitch",
    website: "Website",
  };

  return labels[platform] ?? platform;
}

export default function ProfilePreview({
  profile,
  compact = false,
}: Props) {
  const viewSent = useRef(false);

  useEffect(() => {
    viewSent.current = false;

    const sendView = () => {
      if (
        viewSent.current ||
        !isPublicRoute(profile.username) ||
        readCookiePreferences()
          ?.analytics !== true
      ) {
        return;
      }

      viewSent.current = true;

      emitAnalytics(
        profile.username,
        "profile_view",
      );
    };

    sendView();

    window.addEventListener(
      "heybio:consent",
      sendView,
    );

    return () => {
      window.removeEventListener(
        "heybio:consent",
        sendView,
      );
    };
  }, [profile.username]);

  const colors = THEMES[
    profile.theme.preset
  ];

  const radius =
    profile.theme.buttonStyle === "pill"
      ? "999px"
      : profile.theme.buttonStyle === "square"
        ? "5px"
        : "16px";

  const name =
    profile.displayName.trim() ||
    profile.username;

  const styles = {
    "--profile-bg": colors.background,
    "--profile-text": colors.text,
    "--profile-accent":
      profile.theme.accent,
    "--profile-button-radius": radius,
  } as CSSProperties;

  return (
    <div
      className={`public-profile ${
        compact
          ? "public-profile--compact"
          : ""
      }`}
      style={styles}
    >
      <div className="public-profile__inner">
        <div className="public-profile__avatar">
          {profile.avatarUrl ? (
            <img
              className="hb-preview-avatar"
              src={profile.avatarUrl}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h1>{name}</h1>

        <p className="public-profile__username">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="public-profile__bio">
            {profile.bio}
          </p>
        )}

        {Boolean(
          profile.socialLinks?.length,
        ) && (
          <nav
            className="hb-preview-socials"
            aria-label={`${name}'s social accounts`}
          >
            {profile.socialLinks?.map(
              (social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="hb-preview-social"
                  aria-label={`Open ${name}'s ${socialLabel(social.platform)}`}
                >
                  <span>
                    {socialLabel(
                      social.platform,
                    )}
                  </span>

                  <ExternalLink
                    size={13}
                    aria-hidden="true"
                  />
                </a>
              ),
            )}
          </nav>
        )}

        <div className="public-profile__links">
          {profile.links.map((link) => (
            <a
              key={link.id}
              className="public-profile__link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              onClick={() =>
                emitAnalytics(
                  profile.username,
                  "link_click",
                  link.id,
                )
              }
            >
              <span className="public-profile__link-icon">
                <ExternalLink
                  size={17}
                  aria-hidden="true"
                />
              </span>

              <span className="public-profile__link-copy">
                <strong>
                  {link.title}
                </strong>

                {link.description && (
                  <small>
                    {link.description}
                  </small>
                )}
              </span>

              <ArrowUpRight
                size={19}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        {profile.links.length === 0 && (
          <p className="public-profile__empty">
            This creator hasn't added any
            public links yet.
          </p>
        )}

        <a
          className="public-profile__branding"
          href="/"
          aria-label="Visit HEYBIO"
        >
          Made with{" "}
          <strong>HEYBIO ↗</strong>
        </a>
      </div>
    </div>
  );
}
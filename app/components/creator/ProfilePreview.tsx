
import {
  ArrowUpRight,
  ExternalLink
} from "lucide-react";

import type {
  ProfileTheme
} from "./ThemePicker";

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  description: string;
};

export type PreviewProfile = {
  username: string;
  displayName: string;
  bio: string;
  theme: ProfileTheme;
  links: PublicLink[];
};

type ProfilePreviewProps = {
  profile: PreviewProfile;
  compact?: boolean;
};

const THEME_COLORS: Record<
  ProfileTheme["preset"],
  { background: string; text: string }
> = {
  classic: {
    background: "#F9F9F6",
    text: "#1A1B19"
  },
  midnight: {
    background: "#171817",
    text: "#FFFFFF"
  },
  ice: {
    background: "#D9EEFF",
    text: "#152A40"
  },
  peach: {
    background: "#FFE0D5",
    text: "#3D2520"
  },
  lavender: {
    background: "#EDE3FF",
    text: "#302044"
  },
  minimal: {
    background: "#FFFFFF",
    text: "#161616"
  }
};

export default function ProfilePreview({
  profile,
  compact = false
}: ProfilePreviewProps) {
  const colors =
    THEME_COLORS[profile.theme.preset];

  const buttonRadius =
    profile.theme.buttonStyle === "pill"
      ? "999px"
      : profile.theme.buttonStyle === "square"
        ? "5px"
        : "16px";

  const displayName =
    profile.displayName.trim() ||
    profile.username;

  return (
    <div
      className={`public-profile ${
        compact ? "public-profile--compact" : ""
      }`}
      style={
        {
          "--profile-bg": colors.background,
          "--profile-text": colors.text,
          "--profile-accent": profile.theme.accent,
          "--profile-button-radius": buttonRadius
        } as React.CSSProperties
      }
    >
      <div className="public-profile__inner">
        <div className="public-profile__avatar">
          <span aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <h1>{displayName}</h1>

        <p className="public-profile__username">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="public-profile__bio">
            {profile.bio}
          </p>
        )}

        <div className="public-profile__links">
          {profile.links.map((link) => (
            <a
              key={link.id}
              className="public-profile__link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
            >
              <span className="public-profile__link-icon">
                <ExternalLink size={18} />
              </span>

              <span className="public-profile__link-copy">
                <strong>{link.title}</strong>

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
            This creator hasn't added any public links yet.
          </p>
        )}

        <a
          className="public-profile__branding"
          href="/"
          aria-label="Visit HEYBIO"
        >
          Made with <strong>HEYBIO ↗</strong>
        </a>
      </div>
    </div>
  );
}
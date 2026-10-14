
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";

export interface ProfileHeaderProps {
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  profileUrl: string;
  published?: boolean;
}

export default function ProfileHeader({
  username,
  displayName,
  bio,
  avatarUrl,
  profileUrl,
  published = false
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyProfile() {
    setError("");

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
    } catch {
      setError("Copy failed. Please copy the link manually.");
    }
  }

  const name = displayName.trim() || username;

  return (
    <section className="hb-creator-profile-header">
      <div className="hb-creator-profile-header__identity">
        <div className="hb-creator-profile-header__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="hb-creator-profile-header__details">
          <span className="hb-creator-eyebrow">YOUR CREATOR SPACE</span>
          <h1>{name}</h1>
          <p className="hb-creator-profile-header__username">
            @{username}
          </p>
          {bio && <p className="hb-creator-profile-header__bio">{bio}</p>}
        </div>
      </div>

      <div className="hb-creator-profile-header__bottom">
        <span className={`hb-creator-profile-header__badge ${published ? "is-published" : ""}`}>
          <span aria-hidden="true">●</span>
          {published ? "Published" : "Not published"}
        </span>

        <div className="hb-creator-profile-header__buttons">
          <button
            type="button"
            className="hb-creator-button hb-creator-button--secondary"
            onClick={() => void copyProfile()}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy link"}
          </button>

          {published && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hb-creator-button hb-creator-button--primary"
            >
              View page
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>

      {error && <p role="alert" className="hb-creator-error">{error}</p>}
    </section>
  );
}

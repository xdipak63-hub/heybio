
import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Share2
} from "lucide-react";

export interface SharePanelProps {
  profileUrl: string;
  username: string;
  published: boolean;
}

export default function SharePanel({
  profileUrl,
  username,
  published
}: SharePanelProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(profileUrl);
      setMessage("Profile link copied.");
    } catch {
      setError("Unable to copy automatically.");
    }
  }

  async function share() {
    setError("");
    if (!published) return;

    if (!navigator.share) {
      await copy();
      return;
    }

    try {
      await navigator.share({
        title: `@${username} on HEYBIO`,
        text: "Explore my world on HEYBIO.",
        url: profileUrl
      });
    } catch (cause) {
      if (
        cause instanceof DOMException &&
        cause.name === "AbortError"
      ) return;

      setError("Sharing was not completed.");
    }
  }

  return (
    <section className="hb-creator-share">
      <div className="hb-creator-share__heading">
        <span className="hb-creator-eyebrow">SHARE YOUR WORLD</span>
        <h2>One link. Everywhere.</h2>
        <p>
          Add your HEYBIO link to your social profiles,
          website or messages.
        </p>
      </div>

      <div className="hb-creator-share__url">
        <span>{profileUrl}</span>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label="Copy profile URL"
        >
          <Copy size={18} />
        </button>
      </div>

      <div className="hb-creator-share__actions">
        <button
          type="button"
          className="hb-creator-button hb-creator-button--primary"
          onClick={() => void share()}
          disabled={!published}
        >
          <Share2 size={17} />
          Share profile
        </button>

        {published && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hb-creator-button hb-creator-button--secondary"
          >
            Open profile
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {!published && (
        <p className="hb-creator-share__hint">
          Publish your page before sharing it publicly.
        </p>
      )}

      {message && (
        <p role="status" className="hb-creator-success">
          <Check size={15} aria-hidden="true" />
          {message}
        </p>
      )}

      {error && <p role="alert" className="hb-creator-error">{error}</p>}
    </section>
  );
}

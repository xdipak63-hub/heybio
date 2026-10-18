
import { useEffect, useId, useState } from "react";
import {
  Check,
  ExternalLink,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Github,
  Twitch,
  Plus,
  Trash2,
  Save,
  LoaderCircle,
  type LucideIcon
} from "lucide-react";

export const SOCIAL_PLATFORMS = [
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
  "website"
] as const;

export type SocialPlatform =
  (typeof SOCIAL_PLATFORMS)[number];

export interface CreatorSocialLink {
  id?: string;
  platform: SocialPlatform;
  url: string;
  position: number;
  is_visible: boolean;
}

export interface SocialLinksProps {
  links: CreatorSocialLink[];
  onSave: (links: CreatorSocialLink[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const ICONS: Partial<Record<SocialPlatform, LucideIcon>> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
  website: Globe
};

const LABELS: Record<SocialPlatform, string> = {
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
  website: "Website"
};

function validSocialUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());

    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.href.length > 2048
    ) {
      return null;
    }

    // The database requires HTTPS and at least
    // 10 characters.
    if (url.href.length < 10) return null;

    return url.href;
  } catch {
    return null;
  }
}

export default function SocialLinks({
  links,
  onSave,
  disabled = false,
  className = ""
}: SocialLinksProps) {
  const fieldId = useId();

  const [items, setItems] = useState<CreatorSocialLink[]>(
    () => links.map((item) => ({ ...item }))
  );

  const [selected, setSelected] =
    useState<SocialPlatform>("instagram");

  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!dirty && !busy) {
      setItems(links.map((item) => ({ ...item })));
    }
  }, [links, dirty, busy]);

  const available = SOCIAL_PLATFORMS.filter(
    (platform) =>
      !items.some((item) => item.platform === platform)
  );

  function markChanged() {
    setDirty(true);
    setSuccess("");
    setError("");
  }

  function addPlatform() {
    const next = available.includes(selected)
      ? selected
      : available[0];

    if (disabled || busy || !next) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        platform: next,
        url: "",
        position: current.length,
        is_visible: true
      }
    ]);

    markChanged();
  }

  function updateItem(
    platform: SocialPlatform,
    changes: Partial<CreatorSocialLink>
  ) {
    setItems((current) =>
      current.map((item) =>
        item.platform === platform
          ? { ...item, ...changes }
          : item
      )
    );

    markChanged();
  }

  function removeItem(platform: SocialPlatform) {
    setItems((current) =>
      current
        .filter((item) => item.platform !== platform)
        .map((item, index) => ({
          ...item,
          position: index
        }))
    );

    markChanged();
  }

  async function save() {
    if (disabled || busy || !dirty) return;

    setError("");
    setSuccess("");

    const seen = new Set<string>();
    const normalized: CreatorSocialLink[] = [];

    for (const item of items) {
      if (seen.has(item.platform)) {
        setError("Each platform can only be added once.");
        return;
      }

      seen.add(item.platform);

      const url = validSocialUrl(item.url);

      if (!url) {
        setError(
          `Enter a valid HTTPS URL for ${LABELS[item.platform]}.`
        );
        return;
      }

      normalized.push({
        ...item,
        url,
        position: normalized.length
      });
    }

    setBusy(true);

    try {
      await onSave(normalized);

      setItems(normalized);
      setDirty(false);
      setSuccess("Social links saved successfully.");
    } catch {
      setError(
        "Could not save your social links. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={`hb-social-editor ${className}`}
      aria-label="Manage social links"
      aria-busy={busy}
    >
      <div className="hb-social-editor__header">
        <div>
          <span className="hb-creator-eyebrow">
            CONNECT YOUR WORLD
          </span>
          <h2>Social links</h2>
          <p>
            Add the places where your audience
            can find you.
          </p>
        </div>

        <span className="hb-social-editor__count">
          {items.length} / {SOCIAL_PLATFORMS.length}
        </span>
      </div>

      <div className="hb-social-editor__list">
        {items.map((item) => {
          const Icon = ICONS[item.platform] ?? Globe;
          const previewUrl = validSocialUrl(item.url);

          return (
            <div
              key={item.platform}
              className="hb-social-editor__item"
            >
              <div className="hb-social-editor__item-top">
                <div className="hb-social-editor__identity">
                  <span className="hb-social-editor__icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <strong>{LABELS[item.platform]}</strong>
                </div>

                <button
                  type="button"
                  className="hb-social-editor__remove"
                  onClick={() => removeItem(item.platform)}
                  disabled={disabled || busy}
                  aria-label={`Remove ${LABELS[item.platform]}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <label
                className="hb-social-editor__field"
                htmlFor={`${fieldId}-${item.platform}`}
              >
                Profile URL
              </label>

              <div className="hb-social-editor__input-row">
                <input
                  id={`${fieldId}-${item.platform}`}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com/yourprofile"
                  value={item.url}
                  maxLength={2048}
                  disabled={disabled || busy}
                  onChange={(event) =>
                    updateItem(item.platform, {
                      url: event.target.value
                    })
                  }
                />

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    aria-label={`Preview ${LABELS[item.platform]}`}
                  >
                    <ExternalLink size={17} />
                  </a>
                )}
              </div>

              <label className="hb-social-editor__visibility">
                <input
                  type="checkbox"
                  checked={item.is_visible}
                  disabled={disabled || busy}
                  onChange={(event) =>
                    updateItem(item.platform, {
                      is_visible: event.target.checked
                    })
                  }
                />
                <span>Show on public profile</span>
              </label>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="hb-social-editor__empty">
          <Globe size={24} aria-hidden="true" />
          <strong>Your world starts here.</strong>
          <p>Add your first social account.</p>
        </div>
      )}

      {available.length > 0 && (
        <div className="hb-social-editor__add">
          <label htmlFor={`${fieldId}-platform`}>
            Add a platform
          </label>

          <div className="hb-social-editor__add-row">
            <select
              id={`${fieldId}-platform`}
              value={
                available.includes(selected)
                  ? selected
                  : available[0]
              }
              onChange={(event) =>
                setSelected(event.target.value as SocialPlatform)
              }
              disabled={disabled || busy}
            >
              {available.map((platform) => (
                <option key={platform} value={platform}>
                  {LABELS[platform]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={addPlatform}
              disabled={disabled || busy}
              className="hb-creator-button hb-creator-button--secondary"
            >
              <Plus size={17} aria-hidden="true" />
              Add
            </button>
          </div>
        </div>
      )}

      <div className="hb-social-editor__footer">
        <span>
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </span>

        <button
          type="button"
          className="hb-creator-button hb-creator-button--primary"
          onClick={() => void save()}
          disabled={!dirty || disabled || busy}
        >
          {busy ? (
            <LoaderCircle
              size={17}
              className="hb-creator-spin"
              aria-hidden="true"
            />
          ) : (
            <Save size={17} aria-hidden="true" />
          )}
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="hb-creator-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="hb-creator-success" role="status">
          <Check size={16} aria-hidden="true" />
          {success}
        </p>
      )}
    </section>
  );
}

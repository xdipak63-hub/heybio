
import type { ReactNode } from "react";
import { ArrowUpRight, EyeOff, GripVertical } from "lucide-react";
import type { CreatorLink } from "../../lib/validation/links.schema";

export interface LinkCardProps {
  link: CreatorLink;
  actions?: ReactNode;
  draggableHandle?: boolean;
  className?: string;
}

function safeDestination(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password
    ) return null;
    return url.href;
  } catch {
    return null;
  }
}

export default function LinkCard({
  link,
  actions,
  draggableHandle = false,
  className = ""
}: LinkCardProps) {
  const destination = safeDestination(link.url);

  return (
    <article
      className={`hb-creator-link-card ${!link.is_active ? "is-hidden" : ""} ${className}`}
      aria-label={link.title}
    >
      {draggableHandle && (
        <span className="hb-creator-link-card__handle" aria-hidden="true">
          <GripVertical size={19} />
        </span>
      )}

      <div className="hb-creator-link-card__body">
        <div className="hb-creator-link-card__heading">
          <h3>{link.title}</h3>
          {!link.is_active && (
            <span className="hb-creator-link-card__status">
              <EyeOff size={13} aria-hidden="true" />
              Hidden
            </span>
          )}
        </div>

        {destination ? (
          <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="hb-creator-link-card__url"
            title={destination}
          >
            {destination}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ) : (
          <span className="hb-creator-link-card__invalid">
            Invalid destination URL
          </span>
        )}

        {link.description && (
          <p>{link.description}</p>
        )}
      </div>

      {actions && (
        <div className="hb-creator-link-card__actions">
          {actions}
        </div>
      )}
    </article>
  );
}


import { Form, useNavigation } from "react-router";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { CreatorLink } from "../../lib/validation/links.schema";

export interface LinkReorderProps {
  links: CreatorLink[];
  className?: string;
}

export default function LinkReorder({
  links,
  className = ""
}: LinkReorderProps) {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const ordered = [...links].sort(
    (a, b) => a.position - b.position
  );

  return (
    <section
      className={`hb-creator-reorder ${className}`}
      aria-label="Reorder profile links"
      aria-busy={busy}
    >
      <div className="hb-creator-reorder__intro">
        <h2>Link order</h2>
        <p>Move links to control how they appear on your page.</p>
      </div>

      <ol className="hb-creator-reorder__list">
        {ordered.map((link, index) => (
          <li key={link.id} className="hb-creator-reorder__item">
            <GripVertical size={18} aria-hidden="true" />

            <div className="hb-creator-reorder__name">
              <strong>{link.title}</strong>
              <span>
                Position {index + 1}
                {!link.is_active ? " · Hidden" : ""}
              </span>
            </div>

            <div className="hb-creator-reorder__controls">
              {(["up", "down"] as const).map((direction) => (
                <Form method="post" key={direction}>
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={link.id} />
                  <input type="hidden" name="direction" value={direction} />

                  <button
                    type="submit"
                    disabled={
                      busy ||
                      (direction === "up" && index === 0) ||
                      (direction === "down" && index === ordered.length - 1)
                    }
                    aria-label={`Move ${link.title} ${direction}`}
                    className="hb-creator-icon-button"
                  >
                    {direction === "up" ? (
                      <ArrowUp size={17} />
                    ) : (
                      <ArrowDown size={17} />
                    )}
                  </button>
                </Form>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {ordered.length === 0 && (
        <p className="hb-creator-empty">Add a link to start organizing.</p>
      )}
    </section>
  );
}

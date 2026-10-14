
import { ArrowUpRight, Check } from "lucide-react";

const themes = [
  {
    name: "The Minimalist",
    description: "Quiet, clear and considered.",
    className: "minimal"
  },
  {
    name: "The Creator",
    description: "A little more personality.",
    className: "creator"
  },
  {
    name: "After Dark",
    description: "Confident contrast.",
    className: "dark"
  }
] as const;

export default function ThemeShowcase() {
  return (
    <section
      id="templates"
      className="hm-section hm-themes"
      aria-labelledby="hm-themes-title"
    >
      <div className="hm-wrap">
        <div className="hm-section-head">
          <span className="hm-eyebrow">YOUR LOOK. YOUR RULES.</span>
          <h2 id="hm-themes-title">
            Your page should look like you.
          </h2>
          <p>
            Explore visual directions for your HEYBIO page,
            from understated to expressive.
          </p>
        </div>

        <div className="hm-themes__grid">
          {themes.map((theme) => (
            <article className="hm-theme" key={theme.name}>
              <div className={`hm-theme__preview hm-theme__preview--${theme.className}`}>
                <div className="hm-theme__avatar" aria-hidden="true">Y</div>
                <strong>@yourname</strong>
                <span>Your corner of the internet.</span>

                <div className="hm-theme__links" aria-hidden="true">
                  <div>My work <ArrowUpRight size={15} /></div>
                  <div>My links <ArrowUpRight size={15} /></div>
                  <div>Say hello <ArrowUpRight size={15} /></div>
                </div>
              </div>

              <div className="hm-theme__caption">
                <div>
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                </div>
                <Check size={18} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>

        <p className="hm-showcase__disclaimer">
          These are illustrative design previews. Available themes
          depend on the implemented appearance options and plan.
        </p>
      </div>
    </section>
  );
}

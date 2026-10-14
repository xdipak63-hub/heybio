
import { ArrowUpRight, Link2, Play, Palette } from "lucide-react";

const examples = [
  {
    name: "The Creator",
    handle: "@yourstudio",
    description: "Videos, projects and everything in between.",
    links: ["Latest video", "My portfolio", "Collaborate"],
    theme: "creator",
    icon: Play
  },
  {
    name: "The Minimalist",
    handle: "@yourspace",
    description: "Thoughts, work and things worth sharing.",
    links: ["Selected work", "Journal", "Get in touch"],
    theme: "minimal",
    icon: Link2
  },
  {
    name: "After Dark",
    handle: "@yourmusic",
    description: "Sound, stories and new releases.",
    links: ["Listen now", "Upcoming releases", "Socials"],
    theme: "dark",
    icon: Palette
  }
] as const;

export default function CreatorShowcase() {
  return (
    <section
      id="explore"
      className="hm-section hm-showcase"
      aria-labelledby="hm-showcase-title"
    >
      <div className="hm-wrap">
        <div className="hm-section-head">
          <span className="hm-eyebrow">MADE FOR YOUR WORLD</span>
          <h2 id="hm-showcase-title">
            One link. Endless ways to be you.
          </h2>
          <p>
            A creator profile should feel personal, not like
            another list of URLs.
          </p>
        </div>

        <div className="hm-showcase__grid">
          {examples.map((example) => {
            const Icon = example.icon;

            return (
              <article
                key={example.handle}
                className={`hm-example hm-example--${example.theme}`}
              >
                <div className="hm-example__header">
                  <span>{example.name}</span>
                  <Icon size={19} aria-hidden="true" />
                </div>

                <div className="hm-example__identity">
                  <div className="hm-example__avatar" aria-hidden="true">
                    {example.handle.charAt(1).toUpperCase()}
                  </div>
                  <h3>{example.handle}</h3>
                  <p>{example.description}</p>
                </div>

                <div className="hm-example__links">
                  {example.links.map((link) => (
                    <div key={link}>
                      {link}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <p className="hm-showcase__disclaimer">
          Illustrative profiles created to demonstrate design possibilities.
          They are not real creator endorsements.
        </p>
      </div>
    </section>
  );
}

import type { MetaFunction } from "react-router";
import { ArrowUpRight, Palette, Sparkles } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "Templates — HEYBIO" },
  {
    name: "description",
    content:
      "Discover the visual directions behind HEYBIO creator profiles.",
  },
];

const styles = [
  {
    name: "Minimal",
    category: "CLEAN & SIMPLE",
    background: "#F7F7F2",
    foreground: "#171717",
    accent: "#DCE7CF",
  },
  {
    name: "Midnight",
    category: "BOLD & MODERN",
    background: "#171717",
    foreground: "#FFFFFF",
    accent: "#BDF806",
  },
  {
    name: "Lavender",
    category: "SOFT & CREATIVE",
    background: "#EAE4FF",
    foreground: "#27213C",
    accent: "#FFFFFF",
  },
  {
    name: "Sunset",
    category: "WARM & EXPRESSIVE",
    background: "#FFE5C7",
    foreground: "#442419",
    accent: "#FFBA82",
  },
] as const;

export default function TemplatesPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / TEMPLATES</span>

          <h1>
            Your style.
            <br />
            <span>Your digital space.</span>
          </h1>

          <p>
            Explore design directions for a creator page
            that feels unmistakably yours.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: 24,
            }}
          >
            {styles.map((style) => (
              <article key={style.name}>
                <div
                  style={{
                    background: style.background,
                    color: style.foreground,
                    minHeight: 350,
                    borderRadius: 28,
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 15,
                    textAlign: "center",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: style.accent,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Sparkles size={26} />
                  </div>

                  <strong style={{ fontSize: 22 }}>
                    Your Name
                  </strong>

                  <span>Creator · Artist · Your world</span>

                  {["My latest work", "Find me online"].map(
                    (label) => (
                      <div
                        key={label}
                        style={{
                          background: style.accent,
                          color: style.foreground,
                          borderRadius: 14,
                          padding: "13px 16px",
                          width: "100%",
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </div>
                    ),
                  )}
                </div>

                <div style={{ padding: "20px 4px" }}>
                  <span className="eyebrow">
                    {style.category}
                  </span>
                  <h3>{style.name}</h3>
                </div>
              </article>
            ))}
          </div>

          <p style={{ opacity: 0.7 }}>
            These are visual concept previews, not live
            creator accounts or a claim that every template
            is already selectable in the editor.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <Palette size={30} aria-hidden="true" />
            <h2>Made for your identity.</h2>
            <p>
              HEYBIO is designed to let your content and
              personal style take center stage.
            </p>
          </div>

          <a href="/features" className="button button--dark">
            Explore features
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
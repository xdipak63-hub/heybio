import type { MetaFunction } from "react-router";
import { ArrowUpRight, Bell, Sparkles } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "What's New — HEYBIO" },
  {
    name: "description",
    content:
      "Product updates and release information for HEYBIO.",
  },
];

export default function WhatsNewPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / WHAT'S NEW</span>

          <h1>
            Progress worth
            <br />
            <span>sharing.</span>
          </h1>

          <p>
            A dedicated place for product releases,
            improvements and feature announcements.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="feature-grid">
            <article className="feature-card">
              <Sparkles size={32} aria-hidden="true" />

              <h2>Product updates</h2>

              <p>
                Release notes will be published here
                once features are available in the
                production application.
              </p>
            </article>

            <article className="feature-card">
              <Bell size={32} aria-hidden="true" />

              <h2>Announcements</h2>

              <p>
                Major product milestones will be shared
                through HEYBIO's official channels.
              </p>
            </article>
          </div>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">RELEASE HISTORY</span>
            <h2>No public releases listed yet.</h2>
            <p>
              This changelog will only include
              verified releases. Planned functionality
              is not presented as already shipped.
            </p>
          </div>

          <a
            href="/news"
            className="button button--dark"
          >
            Visit newsroom
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
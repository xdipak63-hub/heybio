import type { MetaFunction } from "react-router";
import { ArrowUpRight, Layers3, Rocket, ShieldCheck } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "DIPO LABS — The Team Behind HEYBIO" },
  {
    name: "description",
    content:
      "Discover DIPO LABS, the creator of HEYBIO and HYPE DROP.",
  },
];

export default function AboutDipoLabsPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">COMPANY / DIPO LABS</span>

          <h1>
            Ideas deserve
            <br />
            <span>better experiences.</span>
          </h1>

          <p>
            DIPO LABS is the brand behind HEYBIO and
            HYPE DROP. We are focused on building
            distinctive digital products.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="feature-grid">
            <article className="feature-card">
              <Layers3 size={32} aria-hidden="true" />
              <h2>Product thinking</h2>
              <p>
                We approach products as complete experiences,
                from the first interaction to everyday use.
              </p>
            </article>

            <article className="feature-card">
              <Rocket size={32} aria-hidden="true" />
              <h2>Ambitious design</h2>
              <p>
                We aim for interfaces that are expressive,
                purposeful and easy to understand.
              </p>
            </article>

            <article className="feature-card">
              <ShieldCheck size={32} aria-hidden="true" />
              <h2>Responsible engineering</h2>
              <p>
                Authentication, data protection and
                reliable integrations are central
                to our development approach.
              </p>
            </article>
          </div>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">OUR PRODUCTS</span>
            <h2>Distinct products. Shared ambition.</h2>
            <p>
              HEYBIO is a creator identity platform.
              HYPE DROP is a separate DIPO LABS product,
              with access planned for eligible HEYBIO
              subscription tiers.
            </p>
          </div>

          <a href="/contact" className="button button--dark">
            Contact DIPO LABS
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
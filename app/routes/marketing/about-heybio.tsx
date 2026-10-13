import type { MetaFunction } from "react-router";
import { ArrowUpRight, Heart, Link2, Sparkles } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "About HEYBIO — Your world. One link." },
  {
    name: "description",
    content:
      "Learn about HEYBIO, a link-in-bio platform created by DIPO LABS.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Expression",
    text: "Your online presence should reflect who you are.",
  },
  {
    icon: Link2,
    title: "Connection",
    text: "Make it easier for people to find everything you share.",
  },
  {
    icon: Sparkles,
    title: "Creativity",
    text: "Thoughtful design should be accessible to every creator.",
  },
];

export default function AboutHeybioPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">ABOUT / HEYBIO</span>
          <h1>
            More than links.
            <br />
            <span>A place for you.</span>
          </h1>
          <p>
            HEYBIO is a creator-focused link-in-bio platform
            by DIPO LABS. Our goal is to make your digital
            world easier to discover and more beautiful to share.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">WHAT DRIVES US</span>
            <h2>Built around your identity.</h2>
            <p>
              A great creator page should be easy to manage,
              welcoming to visitors and unmistakably personal.
            </p>
          </div>

          <div className="feature-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  className="feature-card"
                  key={value.title}
                >
                  <Icon size={30} aria-hidden="true" />
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">OUR DIRECTION</span>
            <h2>Your world. One link.</h2>
            <p>
              We are building HEYBIO as a home for creators,
              independent professionals and businesses.
            </p>
          </div>

          <a
            href="/about-dipolabs"
            className="button button--dark"
          >
            Meet DIPO LABS
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
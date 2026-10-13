import type { MetaFunction } from "react-router";
import { ArrowUpRight } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "Our Story — HEYBIO" },
  {
    name: "description",
    content:
      "The thinking and vision behind HEYBIO by DIPO LABS.",
  },
];

const chapters = [
  {
    number: "01",
    title: "A simpler way to share",
    text:
      "People create across many platforms. We believe they deserve one beautiful destination that brings their work together.",
  },
  {
    number: "02",
    title: "Identity before everything",
    text:
      "A link page should feel like a personal space, not just a collection of buttons.",
  },
  {
    number: "03",
    title: "Built for what comes next",
    text:
      "Our direction includes creator tools, customization, insights and thoughtfully connected experiences.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / OUR STORY</span>

          <h1>
            Every idea
            <br />
            <span>starts somewhere.</span>
          </h1>

          <p>
            HEYBIO begins with a simple belief:
            your digital identity deserves a
            better home.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="feature-grid">
            {chapters.map((chapter) => (
              <article
                className="feature-card"
                key={chapter.number}
              >
                <span className="eyebrow">
                  CHAPTER {chapter.number}
                </span>

                <h2>{chapter.title}</h2>
                <p>{chapter.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">WHAT'S NEXT</span>
            <h2>We're just getting started.</h2>
            <p>
              HEYBIO is being developed by DIPO LABS
              with a focus on thoughtful design and
              dependable product foundations.
            </p>
          </div>

          <a href="/features" className="button button--dark">
            Explore our vision
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
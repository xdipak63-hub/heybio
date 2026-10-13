import type { MetaFunction } from "react-router";
import { ArrowUpRight, Newspaper } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "News — HEYBIO" },
  {
    name: "description",
    content:
      "Official announcements and news from HEYBIO by DIPO LABS.",
  },
];

export default function NewsPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / NEWSROOM</span>

          <h1>
            The latest
            <br />
            <span>from our world.</span>
          </h1>

          <p>
            The official destination for verified
            HEYBIO announcements and product news.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 120 }}
        >
          <div
            className="feature-card"
            style={{ maxWidth: 760 }}
          >
            <Newspaper
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <span className="eyebrow">
              OFFICIAL NEWSROOM
            </span>

            <h2>No announcements published yet.</h2>

            <p>
              Official articles will appear here
              after they are reviewed and published.
              We don't display invented headlines,
              dates or press coverage.
            </p>

            <a
              href="https://www.instagram.com/haybio.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--dark"
            >
              Follow HEYBIO
              <ArrowUpRight
                size={18}
                aria-hidden="true"
              />
            </a>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
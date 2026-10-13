import type { MetaFunction } from "react-router";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Music2,
  Palette,
  Video,
} from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "Explore — HEYBIO" },
  {
    name: "description",
    content:
      "Discover how creators, artists and businesses can use HEYBIO.",
  },
];

const categories = [
  {
    title: "Content creators",
    description:
      "Give your audience one destination for videos, social accounts and featured content.",
    icon: Video,
  },
  {
    title: "Artists & designers",
    description:
      "Bring together your portfolio, projects, inspiration and commissions.",
    icon: Palette,
  },
  {
    title: "Musicians",
    description:
      "Share releases, performances, music platforms and community links.",
    icon: Music2,
  },
  {
    title: "Photographers",
    description:
      "Showcase galleries, bookings and creative work from one place.",
    icon: Camera,
  },
  {
    title: "Businesses",
    description:
      "Connect customers to your services, website, social channels and contact options.",
    icon: BriefcaseBusiness,
  },
];

export default function ExplorePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / EXPLORE</span>

          <h1>
            Different worlds.
            <br />
            <span>One beautiful connection.</span>
          </h1>

          <p>
            From personal portfolios to creative businesses,
            explore the possibilities of a HEYBIO profile.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="feature-grid">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <article
                  className="feature-card"
                  key={category.title}
                >
                  <Icon
                    size={30}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />

                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </article>
              );
            })}
          </div>

          <p style={{ marginTop: 30, opacity: 0.7 }}>
            This page highlights creator use cases.
            A live, searchable creator directory will
            require published profiles and database-backed
            discovery before it can be enabled.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">EXPRESS YOURSELF</span>
            <h2>There is room for your world here.</h2>
          </div>

          <a href="/templates" className="button button--dark">
            View design concepts
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
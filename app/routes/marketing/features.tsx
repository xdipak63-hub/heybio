import type { MetaFunction } from "react-router";
import {
  ArrowUpRight,
  BarChart3,
  Globe2,
  Link2,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "Features — HEYBIO by DIPO LABS" },
  {
    name: "description",
    content:
      "Explore HEYBIO's creator profiles, link management, customization and analytics vision.",
  },
];

const features = [
  {
    icon: Link2,
    number: "01",
    title: "One home for every link",
    description:
      "Bring your websites, social profiles, projects and content together in one shareable destination.",
  },
  {
    icon: Palette,
    number: "02",
    title: "Make it yours",
    description:
      "Create a profile that reflects your identity with personalized layouts, colors and presentation.",
  },
  {
    icon: Smartphone,
    number: "03",
    title: "Designed for mobile",
    description:
      "Your audience can discover your content through a clean, responsive experience.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Understand engagement",
    description:
      "Creator analytics are part of the HEYBIO platform roadmap, helping you understand visits and link activity.",
  },
  {
    icon: Globe2,
    number: "05",
    title: "Share everywhere",
    description:
      "Use your HEYBIO address across social platforms, messages, portfolios and other online spaces.",
  },
  {
    icon: ShieldCheck,
    number: "06",
    title: "Security by design",
    description:
      "The platform is designed around authenticated account access, protected data and server-side authorization.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / FEATURES</span>

          <h1>
            Everything you share.
            <br />
            <span>Beautifully connected.</span>
          </h1>

          <p>
            A more expressive home for your digital identity.
            Built for creators, businesses and anyone with
            something worth sharing.
          </p>

          <a href="/#pricing" className="button button--dark">
            Explore plans
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>

        <section
          className="container"
          aria-labelledby="features-title"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">BUILT WITH PURPOSE</span>
            <h2 id="features-title">
              The tools behind your presence.
            </h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  className="feature-card"
                  key={feature.number}
                >
                  <span className="eyebrow">
                    {feature.number}
                  </span>

                  <Icon
                    size={32}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
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
            <span className="eyebrow">
              THE HEYBIO EXPERIENCE
            </span>

            <h2>Simple to share. Made to stand out.</h2>

            <p>
              Our focus is an intuitive creator experience,
              distinctive visual design and a reliable
              foundation that can grow with the platform.
            </p>
          </div>

          <a href="/contact" className="button button--dark">
            Get in touch
            <Sparkles size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
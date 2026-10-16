
import type { MetaFunction } from "react-router";

import Navbar from "../../components/marketing/Navbar";
import Hero from "../../components/marketing/Hero";
import HomeExperience from "../../components/marketing/HomeExperience";
import HypeDropSection from "../../components/marketing/HypeDropSection";
import FAQSection from "../../components/marketing/FAQSection";
import FinalCTA from "../../components/marketing/FinalCTA";
import PremiumFooter from "../../components/marketing/PremiumFooter";
import IntroExperience from "../../components/marketing/IntroExperience";

import "../../styles/heybio-home.css";
import "../../styles/heybio-intro.css";

export const meta: MetaFunction = () => [
  {
    title: "HEYBIO ↗ — Your world. One link.",
  },
  {
    name: "description",
    content:
      "Make your own beautiful mini website. Share your social links, content, portfolio and everything you create with one HEYBIO link. Start free.",
  },
  {
    property: "og:title",
    content: "HEYBIO ↗ — Your world. One link.",
  },
  {
    property: "og:description",
    content:
      "Your links, your work and your world. One beautiful personal page.",
  },
];

export default function HomePage() {
  return (
    <div className="hx-home" id="top">
      <a className="hx-skip" href="#main-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <HomeExperience />
        <HypeDropSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <PremiumFooter />
      <IntroExperience />
    </div>
  );
}

import Navbar from "../../components/marketing/Navbar";
import IntroExperience from "../../components/marketing/IntroExperience";
import PremiumFooter from "../../components/marketing/PremiumFooter";

import Hero from "../../components/marketing/Hero";
import CreatorShowcase from "../../components/marketing/CreatorShowcase";
import FeaturesSection from "../../components/marketing/FeaturesSection";
import ThemeShowcase from "../../components/marketing/ThemeShowcase";
import HypeDropSection from "../../components/marketing/HypeDropSection";
import PricingSection from "../../components/marketing/PricingSection";
import FAQSection from "../../components/marketing/FAQSection";
import FinalCTA from "../../components/marketing/FinalCTA";

import "../../styles/marketing-sections.css";

export function meta() {
  return [
    {
      title: "HEYBIO ↗ — Your world. One link."
    },
    {
      name: "description",
      content:
        "Create your personal page with HEYBIO by DIPO LABS. " +
        "Bring your links, content and creativity together."
    },
    {
      property: "og:title",
      content: "HEYBIO — Your world. One link."
    },
    {
      property: "og:description",
      content: "Everything you are. One beautiful link."
    }
  ];
}

export default function HomePage() {
  return (
    <>
      <IntroExperience />
      <Navbar />

      <main id="main-content">
        <Hero />
        <CreatorShowcase />
        <FeaturesSection />
        <ThemeShowcase />
        <HypeDropSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <PremiumFooter />
    </>
  );
}

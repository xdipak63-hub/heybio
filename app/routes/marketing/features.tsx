import type { MetaFunction } from "react-router";
import { ArrowRight, ArrowUpRight, CheckCircle2, Link2, Palette, Smartphone, Layers3 } from "lucide-react";
import { ActionLink, ClosingCTA, EditorialHero, EditorialLayout, Eyebrow, ExampleProfile } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Features — HEYBIO | Your world. One link." },
  { name: "description", content: "Your links, content and work on one beautifully simple HEYBIO creator page. Explore how HEYBIO works." },
];

const steps = [
  ["01", "Claim your username", "Start with a name people can remember."],
  ["02", "Make it personal", "Give your page a photo, bio and style."],
  ["03", "Add what matters", "Keep important links in one easy-to-find place."],
  ["04", "Share your world", "Use your HEYBIO address wherever people discover you."],
] as const;

export default function FeaturesPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / FEATURES" title={<>Everything you share.<br /><em>Beautifully together.</em></>} description="A personal mini website for your content, portfolio, social accounts and favorite places online. One link that feels like you.">
        <div className="he-actions"><ActionLink href="/#claim-username">Create your page</ActionLink><ActionLink href="#how-it-works" secondary>See how it works</ActionLink></div>
        <p className="he-fine"><CheckCircle2 size={16} /> Start free · Build at your own pace</p>
      </EditorialHero>

      <section className="he-container he-showcase he-section he-reveal" aria-labelledby="he-f-visual">
        <div className="he-showcase__copy"><Eyebrow>ONE BEAUTIFUL SPACE</Eyebrow><h2 id="he-f-visual">A better first impression starts here.</h2><p>Instead of sending people to five different places, share one page that helps them find your best work, your social profiles and a way to connect.</p><a className="he-text-link" href="/templates">Explore page styles <ArrowUpRight size={18} /></a></div>
        <div className="he-showcase__art"><div className="he-orbit he-orbit--one">Instagram ↗</div><div className="he-orbit he-orbit--two">Portfolio ↗</div><div className="he-orbit he-orbit--three">YouTube ↗</div><ExampleProfile /></div>
      </section>

      <section className="he-surface he-section" aria-labelledby="he-f-benefits">
        <div className="he-container">
          <div className="he-heading he-reveal"><Eyebrow>BUILT FOR REAL LIFE</Eyebrow><h2 id="he-f-benefits">Less searching.<br /><em>More discovering.</em></h2><p>Simple tools for a more organized online presence.</p></div>
          <div className="he-feature-grid">
            <article className="he-feature he-feature--wide he-reveal"><div className="he-feature__top"><Link2 /><span>01 / LINKS</span></div><h3>Put your best link first.</h3><p>Add, organize and update your destinations whenever your work changes.</p><div className="he-link-list" aria-hidden="true"><span>↕ &nbsp; Latest video <ArrowUpRight size={16} /></span><span>↕ &nbsp; My portfolio <ArrowUpRight size={16} /></span><span>↕ &nbsp; Contact & collaborations <ArrowUpRight size={16} /></span></div></article>
            <article className="he-feature he-feature--lime he-reveal"><Palette /><h3>Make it feel like you.</h3><p>Choose a profile look, then build a page that reflects your personality. Some customization features vary by plan.</p><div className="he-swatch-row" aria-label="Brand-color samples"><span /><span /><span /></div></article>
            <article className="he-feature he-reveal"><Smartphone /><h3>Ready for small screens.</h3><p>A simple layout your audience can browse comfortably from a phone.</p><div className="he-feature__label">MOBILE-FIRST THINKING</div></article>
            <article className="he-feature he-feature--wide he-reveal"><Layers3 /><h3>One place to keep up with your work.</h3><p>Change links and refresh your public profile without needing to rebuild an entire website each time.</p><div className="he-feature__bars" aria-hidden="true"><span /><span /><span /></div></article>
          </div>
        </div>
      </section>

      <section className="he-container he-section" id="how-it-works" aria-labelledby="he-f-steps"><div className="he-heading he-reveal"><Eyebrow>FOUR SIMPLE STEPS</Eyebrow><h2 id="he-f-steps">From idea to<br /><em>your own space.</em></h2></div><div className="he-steps">{steps.map(([num, title, text]) => <article className="he-step he-reveal" key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p><ArrowRight size={19} aria-hidden="true" /></article>)}</div></section>
      <section className="he-container he-note he-reveal"><CheckCircle2 size={23} /><p><strong>Good to know:</strong> HEYBIO has a free plan. Paid features and HYPE DROP eligibility are explained separately on the <a href="/pricing">Pricing page</a>.</p></section>
      <ClosingCTA title="Your work deserves a better link." description="Start with the essentials and make your page your own." />
    </EditorialLayout>
  );
}

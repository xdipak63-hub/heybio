import type { MetaFunction } from "react-router";
import { ArrowUpRight, Boxes, Compass, Rocket, ShieldCheck } from "lucide-react";
import { ActionLink, ClosingCTA, EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "About DIPO LABS — Creators of HEYBIO" },
  { name: "description", content: "DIPO LABS builds HEYBIO and HYPE DROP as distinct creator-focused digital products." },
];

export default function AboutDipoLabsPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="COMPANY / DIPO LABS" title={<>Small details.<br /><em>Big ideas.</em></>} description="DIPO LABS is the creator of HEYBIO and HYPE DROP. We are building digital experiences with an eye for clarity, usefulness and personality.">
        <div className="he-actions"><ActionLink href="/contact">Get in touch</ActionLink><ActionLink href="/our-story" secondary>Read our story</ActionLink></div>
      </EditorialHero>
      <section className="he-container he-section he-studio he-reveal"><div className="he-studio__top"><span>DIPO</span><span>LABS ↗</span></div><div className="he-studio__statement">Think clearly.<br /><em>Build thoughtfully.</em></div><div className="he-studio__bottom"><span>Independent product thinking</span><span>Designed for the next generation of creators</span></div></section>
      <section className="he-container he-section" aria-labelledby="he-d-products"><div className="he-heading he-reveal"><Eyebrow>OUR PRODUCT FAMILY</Eyebrow><h2 id="he-d-products">Two ideas.<br /><em>Different jobs.</em></h2><p>Each DIPO LABS product has its own purpose and application boundaries.</p></div><div className="he-product-grid"><article className="he-product he-product--light he-reveal"><div className="he-product__top"><span>01 / CREATOR IDENTITY</span><Boxes size={23} /></div><h3>HEYBIO <span>↗</span></h3><p>One beautiful space for your links, work and online identity.</p><a href="/features">Discover HEYBIO <ArrowUpRight size={18} /></a></article><article className="he-product he-product--dark he-reveal"><div className="he-product__top"><span>02 / CREATOR LAUNCHES</span><Rocket size={23} /></div><h3>HYPE DROP <span>↗</span></h3><p>Make Every Launch Feel Legendary. A separate product focused on launch moments, countdowns and reveals.</p><small>HEYBIO HYPE DROP access is reserved for eligible Premium and Pro Max plans; cross-product integration is subject to rollout.</small><a href="/pricing">View plan eligibility <ArrowUpRight size={18} /></a></article></div></section>
      <section className="he-surface he-section"><div className="he-container he-half"><div className="he-reveal"><Eyebrow>HOW WE THINK</Eyebrow><h2>Design is not decoration.<br /><em>It's how things work.</em></h2></div><div className="he-principles he-reveal"><div><Compass /><h3>Clarity</h3><p>Make the product easy to understand before adding complexity.</p></div><div><ShieldCheck /><h3>Responsibility</h3><p>Build on sound authentication, data access and trustworthy operations.</p></div><div><Rocket /><h3>Momentum</h3><p>Improve in thoughtful releases rather than making unverified promises.</p></div></div></div></section>
      <ClosingCTA label="TALK TO DIPO LABS" title="Good ideas begin with a conversation." description="Have feedback, a partnership question or something to share?" href="/contact" action="Contact us" />
    </EditorialLayout>
  );
}

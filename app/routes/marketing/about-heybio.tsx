import type { MetaFunction } from "react-router";
import { ArrowUpRight, Heart, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { ActionLink, ClosingCTA, EditorialHero, EditorialLayout, Eyebrow, ExampleProfile } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "About HEYBIO — A home for your digital world" },
  { name: "description", content: "Discover HEYBIO, a creator-focused link-in-bio and personal mini website product by DIPO LABS." },
];

export default function AboutHeybioPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="ABOUT / HEYBIO" title={<>Not just links.<br /><em>A little world of your own.</em></>} description="HEYBIO brings the places, projects and people that matter to you into one beautiful, easy-to-share personal page.">
        <div className="he-actions"><ActionLink href="/#claim-username">Make your page</ActionLink><ActionLink href="/features" secondary>Explore features</ActionLink></div>
      </EditorialHero>
      <section className="he-container he-section he-identity" aria-labelledby="he-a-purpose"><div className="he-identity__text he-reveal"><Eyebrow>WHAT HEYBIO IS</Eyebrow><h2 id="he-a-purpose">One link.<br />So much <em>more you.</em></h2><p>You're more than one account or one platform. Your online presence might include videos, music, projects, a business and a way to get in touch. HEYBIO is designed to bring those pieces together without making your visitors work to find them.</p><p>It's your small corner of the internet, organized around you.</p></div><div className="he-identity__visual he-reveal"><ExampleProfile /><span className="he-example-note">Illustrative HEYBIO page · Not a real user endorsement</span></div></section>
      <section className="he-surface he-section"><div className="he-container"><div className="he-heading he-reveal"><Eyebrow>OUR PRINCIPLES</Eyebrow><h2>Designed around<br /><em>the person behind the link.</em></h2></div><div className="he-values"><article className="he-value he-reveal"><span><Heart size={22} /></span><h3>Personal, always.</h3><p>Your page should sound and look like you, not like everyone else.</p></article><article className="he-value he-reveal"><span><Link2 size={22} /></span><h3>Easy to discover.</h3><p>Make it simple for someone to find your content, work and next step.</p></article><article className="he-value he-reveal"><span><Sparkles size={22} /></span><h3>Beauty with purpose.</h3><p>We believe good design should make everyday tasks feel easier.</p></article><article className="he-value he-reveal"><span><ShieldCheck size={22} /></span><h3>Trust comes first.</h3><p>Clear product information, real support channels and no invented testimonials.</p></article></div></div></section>
      <section className="he-container he-section he-half"><div className="he-reveal"><Eyebrow>WHO IT'S FOR</Eyebrow><h2>Your page.<br /><em>Your people.</em></h2></div><div className="he-audience he-reveal">{["Creators & influencers", "Artists & musicians", "Designers & freelancers", "Small businesses", "Students & professionals"].map((name, i) => <div key={name}><span>0{i + 1}</span><strong>{name}</strong><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div></section>
      <section className="he-container he-note he-reveal"><ShieldCheck size={22} /><p><strong>Created by DIPO LABS.</strong> HEYBIO is a distinct product. Learn more about the team and our other product, HYPE DROP, on the <a href="/about-dipolabs">DIPO LABS page</a>.</p></section>
      <ClosingCTA title="Make your space on the internet." description="One username. One personal page. Endless ways to be you." />
    </EditorialLayout>
  );
}

import type { MetaFunction } from "react-router";
import { ArrowUpRight, Instagram, Mail, Newspaper } from "lucide-react";
import { ClosingCTA, EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Latest News — HEYBIO Newsroom" },
  { name: "description", content: "Official news and announcements from HEYBIO by DIPO LABS, published when verified." },
];

export default function NewsPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / NEWSROOM" title={<>Good things<br /><em>worth sharing.</em></>} description="The official home for HEYBIO news, announcements and updates from DIPO LABS. Nothing invented, nothing published before it's ready." />
      <section className="he-container he-section he-news-empty he-reveal" aria-labelledby="he-n-title"><div className="he-news-empty__icon"><Newspaper size={29} /></div><Eyebrow>OFFICIAL NEWSROOM</Eyebrow><h2 id="he-n-title">No news articles published yet.</h2><p>When there's an official announcement to share, you'll find it here. We won't fill the newsroom with pretend press coverage or made-up release dates.</p><a className="he-text-link" href="/whats-new">Looking for product changes? Visit What's New <ArrowUpRight size={18} /></a><div className="he-news-empty__graphic" aria-hidden="true"><span>HEYBIO ↗</span><strong>News, when it matters.</strong><span>BY DIPO LABS</span></div></section>
      <section className="he-surface he-section"><div className="he-container"><div className="he-heading he-reveal"><Eyebrow>STAY CONNECTED</Eyebrow><h2>Follow the journey.<br /><em>At your pace.</em></h2></div><div className="he-contact-methods"><article className="he-contact-method he-reveal"><Instagram size={26} /><h3>Instagram</h3><p>Visit the official HEYBIO profile for content shared there.</p><a href="https://www.instagram.com/haybio.in/" target="_blank" rel="noopener noreferrer">@haybio.in <ArrowUpRight size={18} /></a></article><article className="he-contact-method he-reveal"><Mail size={26} /><h3>Press & enquiries</h3><p>Have a media or collaboration question? Reach out directly.</p><a href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Media%20Enquiry">Email DIPO LABS <ArrowUpRight size={18} /></a></article></div></div></section>
      <ClosingCTA label="EXPLORE THE PRODUCT" title="Start with what HEYBIO is building." description="Discover how HEYBIO helps creators bring their online world together." href="/features" action="Explore HEYBIO" />
    </EditorialLayout>
  );
}

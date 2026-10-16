import type { MetaFunction } from "react-router";
import { ArrowUpRight, Bell, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { ClosingCTA, EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "What's New — HEYBIO Product Updates" },
  { name: "description", content: "HEYBIO product release notes and improvements, shared after they are verified and available." },
];

export default function WhatsNewPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / WHAT'S NEW" title={<>A little better.<br /><em>Every thoughtful update.</em></>} description="Follow the evolution of HEYBIO. Verified feature releases, product refinements and important changes will be documented here." />
      <section className="he-container he-section he-updates" aria-labelledby="he-u-title"><div className="he-updates__head he-reveal"><div><Eyebrow>RELEASE NOTES</Eyebrow><h2 id="he-u-title">A clear record of progress.</h2></div><span className="he-status"><Clock3 size={16} /> Public changelog pending</span></div><article className="he-changelog he-reveal"><div className="he-changelog__rail"><span /></div><div className="he-changelog__content"><span className="he-changelog__eyebrow"><CalendarDays size={17} /> NO VERIFIED PUBLIC RELEASE ENTRIES</span><h3>Official release history will appear here.</h3><p>We'll publish entries only after the related features have shipped and their availability has been confirmed. Development plans aren't listed as completed releases.</p><a className="he-text-link" href="/news">Read official news <ArrowUpRight size={18} /></a></div></article></section>
      <section className="he-surface he-section"><div className="he-container"><div className="he-heading he-reveal"><Eyebrow>HOW UPDATES WILL WORK</Eyebrow><h2>Useful details.<br /><em>No vague announcements.</em></h2></div><div className="he-values he-values--three"><article className="he-value he-reveal"><span><CheckCircle2 size={21} /></span><h3>What changed</h3><p>A plain-English explanation of the released improvement.</p></article><article className="he-value he-reveal"><span><Bell size={21} /></span><h3>Who it's for</h3><p>Availability and relevant plan restrictions will be clear.</p></article><article className="he-value he-reveal"><span><CalendarDays size={21} /></span><h3>When it shipped</h3><p>Real release dates, only when they have been verified.</p></article></div></div></section>
      <ClosingCTA label="MEET HEYBIO" title="Discover the product behind the updates." description="Learn what HEYBIO is designed to help you create." href="/features" action="Explore features" />
    </EditorialLayout>
  );
}

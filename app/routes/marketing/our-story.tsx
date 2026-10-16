import type { MetaFunction } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { ClosingCTA, EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Our Story — Why HEYBIO exists" },
  { name: "description", content: "The idea behind HEYBIO: helping everyone bring their online identity together in one beautiful, shareable page." },
];

const chapters = [
  { number: "01", tag: "THE PROBLEM", title: "The internet got a little scattered.", description: "A creator has videos in one place, work in another and social profiles everywhere. People shouldn't need a treasure map to find it all." },
  { number: "02", tag: "THE IDEA", title: "What if one link felt like home?", description: "We imagined a small personal space: easy to create, beautiful to visit and flexible enough to grow with someone's work." },
  { number: "03", tag: "THE PRODUCT", title: "A page built around a person.", description: "HEYBIO brings your identity, links and content into a page you can manage and share, without the weight of a full website setup." },
  { number: "04", tag: "THE DIRECTION", title: "Keep making it better.", description: "Our goal is to improve the experience carefully, connect useful creator tools and keep the product clear and approachable." },
] as const;

export default function OurStoryPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / OUR STORY" title={<>It started with<br /><em>one simple idea.</em></>} description="Your online presence shouldn't feel scattered. It should feel like one place that tells your story." />
      <section className="he-container he-quote he-reveal" aria-label="HEYBIO founding principle"><span>“</span><p>You are more than one profile. Your corner of the internet should show it.</p><small>THE IDEA BEHIND HEYBIO</small></section>
      <section className="he-container he-section" aria-labelledby="he-s-chapters"><div className="he-heading he-reveal"><Eyebrow>THE JOURNEY</Eyebrow><h2 id="he-s-chapters">Four chapters.<br /><em>One purpose.</em></h2></div><div className="he-timeline">{chapters.map((chapter) => <article className="he-timeline__item he-reveal" key={chapter.number}><span className="he-timeline__num">{chapter.number}</span><div><span className="he-timeline__tag">{chapter.tag}</span><h3>{chapter.title}</h3><p>{chapter.description}</p></div><ArrowUpRight size={23} aria-hidden="true" /></article>)}</div></section>
      <section className="he-surface he-section"><div className="he-container he-half he-reveal"><div><Eyebrow>CREATED BY DIPO LABS</Eyebrow><h2>Thoughtful products.<br /><em>For real people.</em></h2></div><div><p className="he-body-large">HEYBIO is a product of DIPO LABS. Our story is still being written through design decisions, meaningful features and the creators who use them.</p><a className="he-text-link" href="/about-dipolabs">Meet DIPO LABS <ArrowUpRight size={19} /></a></div></div></section>
      <ClosingCTA title="The next chapter could be yours." description="Bring your work and everything you care about into one space." />
    </EditorialLayout>
  );
}

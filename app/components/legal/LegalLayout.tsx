import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Mail, ShieldCheck } from "lucide-react";
import Navbar from "../marketing/Navbar";
import PremiumFooter from "../marketing/PremiumFooter";
import "../../styles/heybio-legal.css";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  note?: string;
};

type LegalPageProps = {
  kind: "terms" | "privacy" | "cookies" | "community";
  eyebrow: string;
  title: string;
  subtitle: string;
  summary: string;
  highlights: readonly [string, string, string];
  sections: readonly LegalSection[];
  children?: ReactNode;
};

const UPDATED = "15 October 2026";
const LEGAL_LINKS = [
  { kind: "terms", label: "Terms of Service", href: "/terms" },
  { kind: "privacy", label: "Privacy Policy", href: "/privacy" },
  { kind: "cookies", label: "Cookie Policy", href: "/cookies" },
  { kind: "community", label: "Community Guidelines", href: "/community-guidelines" },
] as const;

export default function LegalLayout({ kind, eyebrow, title, subtitle, summary, highlights, sections, children }: LegalPageProps) {
  const [reading, setReading] = useState(0);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - window.innerHeight);
      setReading(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 100);
      const current = sections.filter((section) => {
        const el = document.getElementById(section.id);
        return el && el.getBoundingClientRect().top <= 190;
      }).at(-1);
      if (current) setActive((previous) => previous === current.id ? previous : current.id);
    }
    function onScroll() { if (!frame) frame = window.requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  const position = LEGAL_LINKS.findIndex((page) => page.kind === kind);
  const next = LEGAL_LINKS[(position + 1) % LEGAL_LINKS.length];

  return (
    <div className="hb-legal">
      <a className="hb-legal__skip" href="#legal-content">Skip to legal content</a>
      <div className="hb-legal__progress" aria-hidden="true"><span style={{ width: `${reading}%` }} /></div>
      <Navbar />
      <main id="legal-content">
        <section className="hb-legal__hero">
          <div className="hb-legal__container hb-legal__hero-grid">
            <div>
              <a className="hb-legal__back" href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to HEYBIO</a>
              <p className="hb-legal__eyebrow"><span className="hb-legal__point" /> {eyebrow}</p>
              <h1>{title}<span className="hb-legal__period">.</span></h1>
              <p className="hb-legal__subtitle">{subtitle}</p>
              <div className="hb-legal__meta"><span><BookOpen size={15} aria-hidden="true" /> Plain-language guide</span><span>Updated {UPDATED}</span></div>
            </div>
            <aside className="hb-legal__hero-card" aria-label="At a glance">
              <div className="hb-legal__hero-card-top"><ShieldCheck size={24} strokeWidth={1.8} aria-hidden="true" /><span>AT A GLANCE</span></div>
              <p>{summary}</p>
              <ul>{highlights.map((point) => <li key={point}><span aria-hidden="true">↗</span>{point}</li>)}</ul>
              <span className="hb-legal__hero-card-bottom">CLEAR WORDS. BETTER CHOICES.</span>
            </aside>
          </div>
        </section>

        <nav className="hb-legal__tabs" aria-label="Legal documents"><div className="hb-legal__container hb-legal__tabs-inner">
          {LEGAL_LINKS.map((page) => <a key={page.kind} href={page.href} aria-current={kind === page.kind ? "page" : undefined}>{page.label}</a>)}
        </div></nav>

        <div className="hb-legal__container hb-legal__content-grid">
          <aside className="hb-legal__aside" aria-label="On this page">
            <div className="hb-legal__toc"><p>ON THIS PAGE</p><ol>{sections.map((section, i) => <li key={section.id}><a className={active === section.id ? "hb-legal__toc-active" : ""} href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}><span>{String(i + 1).padStart(2,"0")}</span>{section.title}</a></li>)}</ol></div>
            <div className="hb-legal__support"><Mail size={20} aria-hidden="true" /><strong>Need clarification?</strong><p>Contact our team about these policies.</p><a href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Legal%20Question">Email support <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          </aside>

          <div className="hb-legal__document">
            <div className="hb-legal__intro"><span className="hb-legal__small-label">BEFORE YOU BEGIN</span><p>{summary} This document explains what to expect in more detail. If something is unclear, please contact us before using a feature you have questions about.</p></div>
            {children}
            {sections.map((section, i) => <section className="hb-legal__section" id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}>
              <div className="hb-legal__section-title"><span>{String(i + 1).padStart(2,"0")}</span><h2 id={`${section.id}-heading`}>{section.title}</h2></div>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul className="hb-legal__bullets">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              {section.note && <div className="hb-legal__note"><span>GOOD TO KNOW</span><p>{section.note}</p></div>}
            </section>)}
            <div className="hb-legal__contact"><div><span className="hb-legal__small-label">A HUMAN IS HERE</span><h2>Questions? Let's talk.</h2><p>We'd rather explain a policy clearly than leave you guessing.</p></div><a href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Policy%20Question">Get in touch <ArrowUpRight size={18} aria-hidden="true" /></a></div>
            <a className="hb-legal__next" href={next.href}><span><small>NEXT DOCUMENT</small><strong>{next.label}</strong></span><ArrowRight size={24} aria-hidden="true" /></a>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
}

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight, ArrowUpRight, Check, CircleHelp, Globe2, Heart, Instagram,
  Link2, MousePointer2, Palette, Play, Share2, Sparkles, WandSparkles,
} from "lucide-react";

const steps = [
  { number: "01", title: "Choose your username", copy: "Pick your very own space on the internet.", Icon: MousePointer2 },
  { number: "02", title: "Make it yours", copy: "Add your photo, a short bio and your personal style.", Icon: Palette },
  { number: "03", title: "Bring your links", copy: "Put your content, work and favorite places together.", Icon: Link2 },
  { number: "04", title: "Share your world", copy: "One simple link, ready for everywhere you show up.", Icon: Share2 },
] as const;

const tips = [
  { n: "01", title: "Make your first impression count", copy: "Use a clear profile picture and a bio that says who you are.", color: "lime" },
  { n: "02", title: "Lead with your best work", copy: "Put the link you want people to discover first at the top.", color: "blue" },
  { n: "03", title: "Less clutter. More you.", copy: "Keep your most important destinations easy to find.", color: "white" },
  { n: "04", title: "Give every project a home", copy: "From new releases to portfolios, keep the good stuff together.", color: "soft" },
  { n: "05", title: "Keep your page fresh", copy: "Update your links when you have something new to share.", color: "blue" },
] as const;

const themes = [
  { id: "minimal", label: "Minimal", detail: "Quiet, crisp and effortlessly yours." },
  { id: "creator", label: "Creator", detail: "Confident details with a little personality." },
  { id: "after-dark", label: "After Dark", detail: "A bold look that puts your work first." },
] as const;

type ThemeId = (typeof themes)[number]["id"];

function useScrollReveals() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-hx-reveal]");
    if (!('IntersectionObserver' in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("hx-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function FlowStory() {
  return (
    <section className="hx-section hx-story" id="features" aria-labelledby="hx-story-title">
      <div className="hx-container">
        <div className="hx-heading hx-heading--center" data-hx-reveal>
          <span className="hx-kicker">LESS SEARCHING. MORE SHARING.</span>
          <h2 id="hx-story-title">So many places.<span> One beautiful home.</span></h2>
          <p>You do a lot. Your audience shouldn't have to search everywhere to find it all.</p>
        </div>
        <div className="hx-story__visual" data-hx-reveal>
          <div className="hx-story__scattered" aria-label="Different places creators share their work">
            <span className="hx-story__chip hx-story__chip--one"><Instagram size={19}/> Instagram</span>
            <span className="hx-story__chip hx-story__chip--two"><Play size={19}/> Videos</span>
            <span className="hx-story__chip hx-story__chip--three"><Globe2 size={19}/> Website</span>
            <span className="hx-story__chip hx-story__chip--four"><Heart size={19}/> Projects</span>
            <span className="hx-story__chip hx-story__chip--five"><Link2 size={19}/> More links</span>
          </div>
          <div className="hx-story__connector" aria-hidden="true"><div className="hx-story__line"/><span><ArrowRight size={23}/></span></div>
          <div className="hx-story__result">
            <div className="hx-story__result-head"><span className="hx-story__result-avatar">Y</span><div><strong>@yourworld</strong><small>All your links, beautifully together</small></div></div>
            <div className="hx-story__result-link">My latest work <ArrowUpRight size={17}/></div>
            <div className="hx-story__result-link">My social world <ArrowUpRight size={17}/></div>
            <div className="hx-story__result-link">Let's connect <ArrowUpRight size={17}/></div>
            <small className="hx-story__sample">Example HEYBIO page · Not a real creator account</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="hx-section hx-how" id="how-it-works" aria-labelledby="hx-how-title">
      <div className="hx-container">
        <div className="hx-heading" data-hx-reveal>
          <span className="hx-kicker">FOUR SIMPLE STEPS</span>
          <h2 id="hx-how-title">Simple to start.<span> Yours to make.</span></h2>
          <p>From an idea to a shareable page, without the complicated setup.</p>
        </div>
        <div className="hx-how__grid">
          {steps.map(({ number, title, copy, Icon }) => (
            <article className="hx-how__step" key={number} data-hx-reveal>
              <div className="hx-how__step-top"><span>{number}</span><Icon size={22} strokeWidth={1.7} aria-hidden="true"/></div>
              <h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TipsBoard() {
  return (
    <section className="hx-section hx-tips" aria-labelledby="hx-tips-title">
      <div className="hx-container hx-tips__layout">
        <div className="hx-tips__intro" data-hx-reveal>
          <span className="hx-kicker">GOOD PAGES START WITH GOOD DETAILS</span>
          <h2 id="hx-tips-title">A few little things.<span> A better first impression.</span></h2>
          <p>Helpful ideas for a page people can understand at a glance. No tricks, just thoughtful details.</p>
          <a className="hx-text-link" href="/features">Explore HEYBIO features <ArrowUpRight size={17}/></a>
        </div>
        <div className="hx-tips__board" aria-label="Five tips for a clear creator page">
          {tips.map((tip, index) => (
            <article className={`hx-tip hx-tip--${tip.color}`} key={tip.n} data-hx-reveal style={{ "--hx-tip-rot": `${index % 2 === 0 ? -2 : 2}deg` } as CSSProperties}>
              <span className="hx-tip__pin" aria-hidden="true"/><span className="hx-tip__number">{tip.n} / A LITTLE TIP</span>
              <h3>{tip.title}</h3><p>{tip.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Templates() {
  const [active, setActive] = useState<ThemeId>("minimal");
  const current = themes.find((theme) => theme.id === active) ?? themes[0];

  return (
    <section className="hx-section hx-templates" id="templates" aria-labelledby="hx-templates-title">
      <div className="hx-container hx-templates__grid">
        <div className="hx-templates__copy" data-hx-reveal>
          <span className="hx-kicker">A PAGE THAT FEELS LIKE YOU</span>
          <h2 id="hx-templates-title">Your style.<span> Your space.</span></h2>
          <p>Not just a list of links. A personal page with a look that matches your world.</p>
          <div className="hx-templates__switch" role="group" aria-label="Preview template styles">
            {themes.map((theme) => (
              <button type="button" key={theme.id} className={theme.id === active ? "hx-templates__tab hx-templates__tab--active" : "hx-templates__tab"} aria-pressed={theme.id === active} onClick={() => setActive(theme.id)}>{theme.label}</button>
            ))}
          </div>
          <p className="hx-templates__detail" aria-live="polite">{current.detail}</p>
          <a className="hx-text-link" href="/templates">Explore templates <ArrowUpRight size={17}/></a>
          <small>Illustrative previews. Actual available designs depend on your plan and product features.</small>
        </div>
        <div className={`hx-templates__stage hx-templates__stage--${active}`} data-hx-reveal>
          <div className="hx-templates__mock" key={active}>
            <span className="hx-templates__top">HEYBIO ↗ <span>PREVIEW</span></span>
            <div className="hx-templates__avatar">Y</div>
            <h3>@yourworld</h3>
            <p>Your corner of the internet.</p>
            {['Discover my work', 'Watch my videos', 'Say hello'].map((label) => <div className="hx-templates__mocklink" key={label}>{label}<ArrowUpRight size={17}/></div>)}
            <span className="hx-templates__made">Made with HEYBIO ↗</span>
          </div>
          <span className="hx-templates__deco hx-templates__deco--one" aria-hidden="true">✳</span>
          <span className="hx-templates__deco hx-templates__deco--two" aria-hidden="true"><Sparkles size={36}/></span>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="hx-section hx-trust" id="why-heybio" aria-labelledby="hx-trust-title">
      <div className="hx-container hx-trust__grid">
        <div data-hx-reveal>
          <span className="hx-kicker">CLEAR FROM DAY ONE</span>
          <h2 id="hx-trust-title">A little less noise.<span> A lot more confidence.</span></h2>
          <p>We're building HEYBIO to keep things simple for creators and visitors alike. No made-up ratings. No confusing promises.</p>
          <a className="hx-text-link" href="/contact">Questions? Talk to us <ArrowUpRight size={17}/></a>
        </div>
        <div className="hx-trust__points">
          <div className="hx-trust__point" data-hx-reveal><Check size={19}/><div><h3>Start with a free plan</h3><p>See what HEYBIO can do before choosing a paid plan.</p></div></div>
          <div className="hx-trust__point" data-hx-reveal><Globe2 size={19}/><div><h3>One link people can open</h3><p>Your public page is made for sharing without asking visitors to sign up.</p></div></div>
          <div className="hx-trust__point" data-hx-reveal><WandSparkles size={19}/><div><h3>Your page, under your control</h3><p>Update your profile and links from your creator account.</p></div></div>
          <div className="hx-trust__point" data-hx-reveal><CircleHelp size={19}/><div><h3>Real people, real support</h3><p>Contact DIPO LABS directly for questions or help.</p></div></div>
        </div>
      </div>
    </section>
  );
}

export default function HomeExperience() {
  useScrollReveals();
  return <><FlowStory/><HowItWorks/><TipsBoard/><Templates/><Trust/></>;
}

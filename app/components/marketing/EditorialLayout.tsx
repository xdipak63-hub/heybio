import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Navbar from "./Navbar";
import PremiumFooter from "./PremiumFooter";
import "../../styles/heybio-editorial.css";

export function EditorialLayout({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(element.querySelectorAll<HTMLElement>(".he-reveal"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("he-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -25px 0px" });
    for (const target of targets) observer.observe(target);
    element.dataset.motion = "on";
    return () => { observer.disconnect(); delete element.dataset.motion; };
  }, []);

  return (
    <div className="he-page" ref={root}>
      <a className="he-skip" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content">{children}</main>
      <PremiumFooter />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="he-eyebrow"><span aria-hidden="true" className="he-eyebrow__line" />{children}</span>;
}

export function EditorialHero({
  label, title, description, children, className = "",
}: {
  label: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`he-container he-hero ${className}`}>
      <div className="he-hero__copy he-reveal">
        <Eyebrow>{label}</Eyebrow>
        <h1>{title}</h1>
        <p className="he-lead">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function ActionLink({ children, href, secondary = false }: {
  children: ReactNode; href: string; secondary?: boolean;
}) {
  return (
    <a className={secondary ? "he-button he-button--secondary" : "he-button he-button--primary"} href={href}>
      {children}<ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}

export function ClosingCTA({ label = "YOUR NEXT STEP", title, description, href = "/#claim-username", action = "Create your HEYBIO" }: {
  label?: string; title: string; description: string; href?: string; action?: string;
}) {
  return (
    <section className="he-container he-section he-closing he-reveal">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ActionLink href={href}>{action}</ActionLink>
    </section>
  );
}

export function ExampleProfile({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`he-profile ${dark ? "he-profile--dark" : ""}`} aria-label="Illustrative creator profile preview">
      <div className="he-profile__top"><span>HEYBIO ↗</span><span>•••</span></div>
      <div className="he-profile__avatar" aria-hidden="true">C</div>
      <strong>@createwithme</strong>
      <p>Design · Music · Everything me</p>
      <div className="he-profile__socials" aria-hidden="true"><span>IG</span><span>YT</span><span>WEB</span></div>
      {[
        "Explore my latest work",
        "Watch my videos",
        "Let's collaborate",
      ].map((link, index) => <div className={index === 0 ? "he-profile__link he-profile__link--featured" : "he-profile__link"} key={link}>
        <span>{link}</span><ArrowUpRight size={15} aria-hidden="true" />
      </div>)}
      <small>Made with HEYBIO ↗</small>
    </div>
  );
}

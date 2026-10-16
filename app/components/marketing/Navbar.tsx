import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import "../../styles/heybio-nav.css";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Explore", href: "/explore" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const menu = menuRef.current;
    menu?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key !== "Tab" || !menu || !toggleRef.current) return;
      const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>("a[href]"));
      if (!links.length) return;
      const first = toggleRef.current;
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  return (
    <header className="hb-header">
      <div className="hb-header__inner">
        <a href="/" className="hb-header__logo" aria-label="HEYBIO home" onClick={() => setOpen(false)}>
          HEYBIO <ArrowUpRight size={23} strokeWidth={2.7} aria-hidden="true" />
        </a>
        <nav className="hb-header__desktop" aria-label="Primary navigation">
          {navLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
        <div className="hb-header__actions">
          <a className="hb-header__login" href="/login">Log in</a>
          <a className="hb-header__create" href="/#claim-username">Get started <ArrowUpRight size={18} aria-hidden="true" /></a>
          <button ref={toggleRef} type="button" className="hb-header__menu" aria-label={open ? "Close menu" : "Open menu"} aria-controls="hb-mobile-nav" aria-expanded={open} onClick={() => setOpen((old) => !old)}>{open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</button>
        </div>
      </div>
      <nav ref={menuRef} id="hb-mobile-nav" className={open ? "hb-header__mobile hb-header__mobile--open" : "hb-header__mobile"} hidden={!open} aria-label="Mobile navigation">
        {navLinks.map((link, i) => <a href={link.href} key={link.href} onClick={() => setOpen(false)}><span>{String(i + 1).padStart(2, "0")}</span>{link.label}<ArrowUpRight size={18} aria-hidden="true" /></a>)}
        <a href="/login" onClick={() => setOpen(false)}><span>05</span>Log in<ArrowUpRight size={18} aria-hidden="true" /></a>
        <a href="/contact" onClick={() => setOpen(false)}><span>06</span>Contact<ArrowUpRight size={18} aria-hidden="true" /></a>
        <a className="hb-header__mobile-cta" href="/#claim-username" onClick={() => setOpen(false)}>Create your page <ArrowUpRight size={18} aria-hidden="true" /></a>
      </nav>
    </header>
  );
}

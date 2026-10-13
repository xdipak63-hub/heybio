import { useState } from "react";
import {
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "HYPE DROP", href: "/#hype-drop" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="hb-header">
      <div className="hb-header__inner">
        <a
          href="/"
          className="hb-header__logo"
          aria-label="HEYBIO homepage"
        >
          HEYBIO<span>↗</span>
        </a>

        <nav
          className="hb-header__desktop"
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hb-header__actions">
          <a
            href="/login"
            className="hb-header__login"
          >
            Log in
          </a>

          <a
            href="/#claim-username"
            className="hb-header__create"
          >
            Create yours
            <ArrowUpRight size={17} />
          </a>

          <button
            type="button"
            className="hb-header__menu"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="hb-mobile-nav"
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      <nav
        id="hb-mobile-nav"
        className={
          open
            ? "hb-header__mobile hb-header__mobile--open"
            : "hb-header__mobile"
        }
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
          >
            <span>0{index + 1}</span>
            {link.label}
            <ArrowUpRight size={20} />
          </a>
        ))}

        <a
          href="/login"
          onClick={() => setOpen(false)}
        >
          <span>05</span>
          Log in
          <ArrowUpRight size={20} />
        </a>

        <a
          className="hb-header__mobile-cta"
          href="/#claim-username"
          onClick={() => setOpen(false)}
        >
          Create your HEYBIO ↗
        </a>
      </nav>
    </header>
  );
}
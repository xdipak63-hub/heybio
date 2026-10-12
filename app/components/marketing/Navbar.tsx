
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
};

const navigation: NavigationItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Explore", href: "/#explore" },
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "HYPE DROP", href: "/#hype-drop" }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <a
          className="brand"
          href="/"
          aria-label="HEYBIO homepage"
          onClick={closeMenu}
        >
          HEYBIO
          <span className="brand-arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <nav
          className="desktop-navigation"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            href="/#pricing"
            className="button button--nav"
          >
            Get started
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={
              menuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={`mobile-navigation ${
          menuOpen ? "mobile-navigation--open" : ""
        }`}
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        <div className="mobile-navigation__links">
          {navigation.map((item, index) => (
            <a
              href={item.href}
              key={item.label}
              onClick={closeMenu}
            >
              <span className="mobile-navigation__number">
                0{index + 1}
              </span>
              <span>{item.label}</span>
              <ArrowUpRight
                size={20}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        <a
          href="/#pricing"
          className="button button--lime mobile-navigation__cta"
          onClick={closeMenu}
        >
          Discover your plan
          <ArrowRight size={18} aria-hidden="true" />
        </a>

        <span className="mobile-navigation__footer">
          Your world. One link.
        </span>
      </nav>
    </header>
  );
}
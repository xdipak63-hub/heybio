
import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Mail
} from "lucide-react";

type FooterLink = {
  label: string;
  href?: string;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Explore", href: "/#explore" },
      { label: "Templates", href: "/#templates" },
      { label: "Pricing", href: "/#pricing" },
      { label: "What's New" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About HEYBIO", href: "/#about" },
      { label: "About DIPO LABS", href: "/#about" },
      { label: "Our Story" },
      { label: "Latest News" },
      { label: "Contact" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center" },
      { label: "Getting Started", href: "/#how-it-works" },
      { label: "FAQs", href: "/#faq" },
      { label: "Support" },
      { label: "Report a Problem" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service" },
      { label: "Privacy Policy" },
      { label: "Cookie Policy" },
      { label: "Community Guidelines" }
    ]
  }
];

function FooterColumn({
  group
}: {
  group: FooterGroup;
}) {
  return (
    <div className="footer-column">
      <h3>{group.title}</h3>

      <ul>
        {group.links.map((link) => (
          <li key={link.label}>
            {link.href ? (
              <a href={link.href}>{link.label}</a>
            ) : (
              <span
                className="footer-link--pending"
                title="This page is being prepared"
              >
                {link.label}
                <span className="sr-only">
                  {" "}— coming soon
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PremiumFooter() {
  return (
    <footer className="site-footer" id="about">
      <div className="container">
        <div className="footer-intro">
          <div>
            <span className="eyebrow eyebrow--light">
              THE NEXT CHAPTER IS YOURS
            </span>

            <h2>
              Your world.
              <br />
              <span>One link.</span>
            </h2>
          </div>

          <a
            href="/#pricing"
            className="footer-intro__action"
          >
            Explore plans
            <ArrowUpRight
              size={25}
              aria-hidden="true"
            />
          </a>
        </div>

        <div className="footer-main">
          <div className="footer-brand">
            <a
              className="brand brand--footer"
              href="/"
              aria-label="HEYBIO homepage"
            >
              HEYBIO
              <span
                className="brand-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>

            <p className="footer-brand__tagline">
              Your world. One link.
            </p>

            <p className="footer-brand__description">
              A better way to express yourself,
              share your work and connect your world.
            </p>

            <div className="footer-social">
              <span>Follow us</span>

              <div className="footer-social__links">
                <span
                  className="footer-social__placeholder"
                  title="Official social account coming soon"
                  aria-label="Instagram account coming soon"
                >
                  <Instagram size={18} />
                </span>

                <span
                  className="footer-social__placeholder"
                  title="Official contact channel coming soon"
                  aria-label="Email contact coming soon"
                >
                  <Mail size={18} />
                </span>
              </div>
            </div>
          </div>

          <div className="footer-columns">
            {footerGroups.map((group) => (
              <FooterColumn
                key={group.title}
                group={group}
              />
            ))}
          </div>
        </div>

        <div className="footer-statement">
          <span>CREATED TO CONNECT.</span>
          <span>BUILT TO EXPRESS.</span>
          <ArrowRight size={20} aria-hidden="true" />
        </div>

        <div className="footer-bottom">
          <p>© 2026 DIPO LABS. All rights reserved.</p>

          <p>HEYBIO is a product of DIPO LABS.</p>

          <a href="/" aria-label="Back to HEYBIO homepage">
            HEYBIO <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
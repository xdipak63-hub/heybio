import Logo from "../shared/Logo";

import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Mail,
} from "lucide-react";

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
};

type FooterGroup = {
  title: string;
  links: readonly FooterLink[];
};

const SUPPORT_EMAIL = "dipolabs123@gmail.com";

const INSTAGRAM_URL =
  "https://www.instagram.com/haybio.in/";

const footerGroups: readonly FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Explore", href: "/explore" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "What's New", href: "/whats-new" },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "About HEYBIO",
        href: "/about-heybio",
      },
      {
        label: "About DIPO LABS",
        href: "/about-dipolabs",
      },
      {
        label: "Our Story",
        href: "/our-story",
      },
      {
        label: "Latest News",
        href: "/news",
      },
      {
        label: "Contact",
        href: "/contact",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Getting Started",
        href: "/features",
      },
      {
        label: "FAQs",
        href: "/#faq",
      },
      {
        label: "Support",
        href: "/contact",
      },
      {
        label: "Report a Problem",
        href:
          `mailto:${SUPPORT_EMAIL}` +
          "?subject=HEYBIO%20Problem%20Report",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Community Guidelines", href: "/community-guidelines" },
    ],
  },
];

function FooterColumn({
  group,
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
              <a
                href={link.href}
                {...(link.external
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
              >
                {link.label}
              </a>
            ) : (
              <span
                className="footer-link--pending"
                title="This page is not yet published"
                aria-label={`${link.label}, not yet published`}
              >
                {link.label}
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
            href="/pricing"
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
            <Logo size="lg" variant="light" className="brand brand--footer" />

            <p className="footer-brand__tagline">
              Your world. One link.
            </p>

            <p className="footer-brand__description">
              A more expressive way to share
              your work, your content and your world.
            </p>

            <div className="footer-social">
              <span>Follow us</span>

              <div className="footer-social__links">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HEYBIO on Instagram"
                  title="Instagram @haybio.in"
                >
                  <Instagram
                    size={18}
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  aria-label="Email HEYBIO"
                  title={SUPPORT_EMAIL}
                >
                  <Mail
                    size={18}
                    aria-hidden="true"
                  />
                </a>
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
          <ArrowRight
            size={20}
            aria-hidden="true"
          />
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} DIPO LABS.
            All rights reserved.
          </p>

          <p>
            HEYBIO is a product of DIPO LABS.
          </p>

          <a
            href="/"
            aria-label="Back to HEYBIO homepage"
          >
            HEYBIO
            <ArrowUpRight
              size={14}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
import type { MetaFunction } from "react-router";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export const meta: MetaFunction = () => [
  { title: "Contact HEYBIO — Support & Enquiries" },
  {
    name: "description",
    content:
      "Contact the HEYBIO team by email or Instagram.",
  },
];

const EMAIL = "dipolabs123@gmail.com";
const INSTAGRAM = "https://www.instagram.com/haybio.in/";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero container">
          <span className="eyebrow">HEYBIO / CONTACT</span>

          <h1>
            Have something
            <br />
            <span>to tell us?</span>
          </h1>

          <p>
            Questions, feedback, collaboration ideas
            or support enquiries—reach us through
            our contact channels.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="feature-grid">
            <article className="feature-card">
              <Mail size={32} aria-hidden="true" />

              <h2>Email us</h2>

              <p>
                For support, questions and business enquiries.
              </p>

              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                  "HEYBIO Enquiry",
                )}`}
                className="button button--dark"
              >
                Send email
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>

              <p style={{ overflowWrap: "anywhere" }}>
                {EMAIL}
              </p>
            </article>

            <article className="feature-card">
              <Instagram size={32} aria-hidden="true" />

              <h2>Instagram</h2>

              <p>
                Find HEYBIO on Instagram and follow
                our product journey.
              </p>

              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--dark"
              >
                @haybio.in
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>
            </article>
          </div>
        </section>

        <section
          className="container"
          style={{ paddingBottom: 100 }}
        >
          <div className="section-heading">
            <span className="eyebrow">SUPPORT</span>
            <h2>We're building something meaningful.</h2>
            <p>
              For account-specific enquiries, avoid
              sending passwords, payment credentials
              or other sensitive information by email
              or social media.
            </p>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
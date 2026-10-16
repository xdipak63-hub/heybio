
import { Link } from "react-router";
import type { MetaFunction } from "react-router";

import {
  ArrowUpRight,
  Bug,
  Lock,
  Mail,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import {
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Report a problem — HEYBIO" },
  {
    name: "description",
    content:
      "Report HEYBIO bugs, broken links, billing problems or suspicious content securely.",
  },
];

const options = [
  {
    icon: Wrench,
    title: "Something isn't working",
    text:
      "Sign-in issues, broken buttons, uploads, creator page problems or unexpected errors.",
    category: "technical",
  },
  {
    icon: ShieldAlert,
    title: "Suspicious or harmful content",
    text:
      "Impersonation, spam, malicious destinations or misuse of a public HEYBIO page.",
    category: "abuse",
  },
  {
    icon: Bug,
    title: "Billing problem",
    text:
      "A subscription, charged amount, failed payment or cancellation that needs a closer look.",
    category: "billing",
  },
] as const;

export default function ReportProblem() {
  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / SAFETY & SUPPORT"
        title={
          <>
            See a problem? <em>Tell us.</em>
          </>
        }
        description="Help us investigate errors and unsafe activity. Reports from signed-in users are stored privately against their account."
      />

      <section
        className="he-container he-section"
        aria-labelledby="report-options"
      >
        <div className="he-heading">
          <Eyebrow>CHOOSE THE RIGHT PATH</Eyebrow>
          <h2 id="report-options">What happened?</h2>
        </div>

        <div className="hb-help-grid">
          {options.map(({
            icon: Icon,
            title,
            text,
            category,
          }) => (
            <Link
              className="hb-help-card"
              to={`/support/submit-ticket?category=${category}`}
              key={category}
            >
              <Icon size={26} aria-hidden="true" />

              <ArrowUpRight
                className="hb-help-card__arrow"
                size={19}
                aria-hidden="true"
              />

              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="he-surface he-section">
        <div
          className="he-container"
          style={{ maxWidth: 850 }}
        >
          <Eyebrow>PRIVACY & SECURITY</Eyebrow>

          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              letterSpacing: "-.04em",
            }}
          >
            Helpful details. No secrets.
          </h2>

          <p
            style={{
              lineHeight: 1.8,
              color: "#5F6067",
            }}
          >
            Include the affected page URL, what went
            wrong, the approximate time and your
            browser. Never include passwords, OTPs,
            bank details or private account credentials.
            For unsafe links, do not open the
            destination just to investigate it.
          </p>

          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Lock size={18} aria-hidden="true" />
            Account tickets require sign-in and
            email verification.
          </p>

          <a
            className="he-button he-button--primary"
            href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Safety%20Report"
          >
            <Mail size={17} aria-hidden="true" />
            Email without signing in
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}

import type { MetaFunction } from "react-router";

import {
  ArrowUpRight,
  BookOpenText,
  CircleHelp,
  LifeBuoy,
  Mail,
} from "lucide-react";

import {
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Help Center — HEYBIO" },
  {
    name: "description",
    content:
      "Get started with HEYBIO, explore answers about plans and profiles, or contact the DIPO LABS support team.",
  },
];

const topics = [
  {
    to: "/support/getting-started",
    title: "Getting started",
    description:
      "Your first account, username, links and creator page.",
    icon: BookOpenText,
  },
  {
    to: "/support/faqs",
    title: "Frequently asked questions",
    description:
      "Plans, HYPE DROP eligibility, accounts and sharing.",
    icon: CircleHelp,
  },
  {
    to: "/contact",
    title: "Contact the team",
    description:
      "Report an issue or ask a question by email.",
    icon: LifeBuoy,
  },
] as const;

export default function HelpCenter() {
  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / SUPPORT"
        title={<>We're here to <em>help.</em></>}
        description="Clear answers and practical guidance for building and sharing your creator page."
      />

      <section
        className="he-container he-section"
        aria-labelledby="help-topics"
      >
        <div className="he-heading">
          <Eyebrow>FIND YOUR WAY</Eyebrow>
          <h2 id="help-topics">
            What can we help with?
          </h2>
        </div>

        <div className="hb-help-grid">
          {topics.map(({
            to,
            title,
            description,
            icon: Icon,
          }) => (
            <a
              className="hb-help-card"
              href={to}
              key={to}
            >
              <Icon size={25} aria-hidden="true" />

              <ArrowUpRight
                className="hb-help-card__arrow"
                size={19}
                aria-hidden="true"
              />

              <h3>{title}</h3>
              <p>{description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="he-surface he-section">
        <div className="he-container hb-help-contact">
          <div>
            <Eyebrow>DIRECT SUPPORT</Eyebrow>

            <h2>Need a human answer?</h2>

            <p>
              Send your question to our support inbox.
              Please don't include passwords, OTPs
              or payment credentials.
            </p>
          </div>

          <a
            className="he-button he-button--primary"
            href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Support"
          >
            <Mail size={17} aria-hidden="true" />
            Email support
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}

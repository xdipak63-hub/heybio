
import type { MetaFunction } from "react-router";

import {
  ArrowUpRight,
  CircleCheck,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

import {
  ActionLink,
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Getting started — HEYBIO" },
  {
    name: "description",
    content:
      "Learn how to create your HEYBIO account, claim a username, add links and share your creator page.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    body: "Select Claim my HEYBIO and sign up. If email verification is required, complete it before continuing.",
    href: "/signup",
    action: "Create an account",
  },
  {
    number: "02",
    title: "Claim your username",
    body: "Choose a unique username that people will recognize. Follow the username step in onboarding.",
    href: "/onboarding/choose-username",
    action: "Choose username",
  },
  {
    number: "03",
    title: "Make it yours",
    body: "Add a display name and bio. Once your account is set up, open Appearance to review your page style.",
    href: "/dashboard/appearance",
    action: "Edit appearance",
  },
  {
    number: "04",
    title: "Add your links",
    body: "Use My Links to add websites, videos, social profiles or a portfolio. Disable links you don't want visitors to see.",
    href: "/dashboard/links",
    action: "Manage links",
  },
  {
    number: "05",
    title: "Preview and share",
    body: "Open Preview to check your active links, then copy your URL from Share. The public page reflects your saved content.",
    href: "/dashboard/share",
    action: "Share your page",
  },
] as const;

export default function GettingStarted() {
  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / GETTING STARTED"
        title={
          <>
            A little setup.{" "}
            <em>A world of links.</em>
          </>
        }
        description="Five simple steps to create a personal page you can share wherever people find you."
      >
        <div className="he-actions">
          <ActionLink href="/signup">
            Start free
          </ActionLink>
        </div>
      </EditorialHero>

      <section
        className="he-container he-section"
        aria-labelledby="guide-title"
      >
        <div className="he-heading">
          <Eyebrow>YOUR FIRST PAGE</Eyebrow>

          <h2 id="guide-title">
            Make it yours, step by step.
          </h2>
        </div>

        <ol className="hb-guide-list">
          {steps.map((step) => (
            <li
              key={step.number}
              className="hb-guide-step"
            >
              <span
                className="hb-guide-step__number"
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>

                <a href={step.href}>
                  {step.action}
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              </div>

              <CircleCheck
                size={23}
                aria-hidden="true"
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="he-surface he-section">
        <div className="he-container hb-help-notes">
          <div>
            <Lightbulb
              size={24}
              aria-hidden="true"
            />

            <h3>Start with the essentials</h3>

            <p>
              A short bio and two or three useful links
              are enough for a great first page.
              You can refine it later.
            </p>
          </div>

          <div>
            <ShieldAlert
              size={24}
              aria-hidden="true"
            />

            <h3>Keep your account secure</h3>

            <p>
              Use a strong password and never share
              your verification codes. If you need
              help,{" "}
              <a href="/contact">
                contact support
              </a>.
            </p>
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}


import type { MetaFunction } from "react-router";

import {
  ArrowUpRight,
  CalendarClock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Subscription cancellation — HEYBIO" },
  {
    name: "description",
    content:
      "How HEYBIO subscription cancellation works and how to get support.",
  },
];

const steps = [
  {
    title: "Open Billing",
    body:
      "Sign in to the account that owns your subscription. Open Dashboard → Billing and check that your subscription is shown.",
  },
  {
    title: "Request cancellation",
    body:
      "If the existing Razorpay-backed cancellation action is available, select Cancel subscription, read the confirmation dialog and authorize the request.",
  },
  {
    title: "Confirm the outcome",
    body:
      "An active subscription is normally requested to end at the current paid cycle. Pending, authenticated or halted states may be cancelled immediately. Always rely on the payment provider's verified final status, not only a browser success message.",
  },
  {
    title: "Check access and charges",
    body:
      "Plan privileges end according to verified subscription expiry or cancellation. Cancelling does not automatically refund an earlier charge, and closing your account is not a substitute for cancelling an authorized mandate.",
  },
] as const;

export default function CancellationPolicy() {
  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / SUBSCRIPTION MANAGEMENT"
        title={
          <>
            Your plan. <em>Your choice.</em>
          </>
        }
        description="How recurring subscription cancellation is designed to work, and what to check before you finish."
      />

      <section
        className="he-container he-section"
        aria-labelledby="cancel-steps"
      >
        <div className="he-heading">
          <Eyebrow>HOW CANCELLATION WORKS</Eyebrow>

          <h2 id="cancel-steps">
            Four straightforward steps.
          </h2>
        </div>

        <div
          className="hb-workspace__note"
          role="note"
        >
          <ShieldCheck size={20} aria-hidden="true" />

          <span>
            <strong>Deployment notice:</strong>{" "}
            The cancellation endpoint exists in code,
            but live Razorpay configuration, webhooks
            and end-to-end behavior have not been
            verified. This page is not evidence that
            live cancellation currently works. Final
            customer-facing terms must be approved
            before paid launch.
          </span>
        </div>

        <ol
          className="hb-guide-list"
          style={{ maxWidth: 930 }}
        >
          {steps.map((step, i) => (
            <li
              className="hb-guide-step"
              key={step.title}
            >
              <span className="hb-guide-step__number">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>

              <CalendarClock
                size={22}
                aria-hidden="true"
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="he-surface he-section">
        <div
          className="he-container"
          style={{ maxWidth: 900 }}
        >
          <Eyebrow>NEED HELP?</Eyebrow>

          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              letterSpacing: "-.04em",
            }}
          >
            Subscription questions deserve answers.
          </h2>

          <p
            style={{
              color: "#5F6067",
              lineHeight: 1.75,
            }}
          >
            If a subscription is not visible, the
            cancellation button fails, or you see an
            unexpected renewal, contact DIPO LABS.
            Include your account email and provider
            subscription reference if you have it.
            Never share OTPs or card details.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <a
              className="he-button he-button--primary"
              href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Subscription%20Cancellation"
            >
              <Mail size={17} aria-hidden="true" />
              Get cancellation support
            </a>

            <a
              className="he-button he-button--secondary"
              href="/dashboard/billing"
            >
              Open Billing
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </a>

            <a
              className="he-button he-button--secondary"
              href="/refund-policy"
            >
              Refund information
            </a>
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}
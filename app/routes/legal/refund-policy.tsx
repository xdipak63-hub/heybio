
import type { MetaFunction } from "react-router";

import {
  ArrowUpRight,
  CreditCard,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Refunds & payment disputes — HEYBIO" },
  {
    name: "description",
    content:
      "How to contact HEYBIO about refund requests, unsuccessful payments, and billing disputes.",
  },
];

const items = [
  {
    title: "If you believe a charge is incorrect",
    body:
      "Contact support with the HEYBIO account email, approximate payment date, amount and the provider payment reference (if available). Never send UPI PINs, card numbers or banking credentials.",
  },
  {
    title: "If payment failed but money was debited",
    body:
      "Check the payment status with your payment provider and bank. If it remains unresolved, contact us so we can review provider-verified transaction records. Do not repeatedly pay to force activation.",
  },
  {
    title: "If you want to request a refund",
    body:
      "Explain the transaction and why you are seeking a refund. Eligibility, any permitted deductions and the resolution process must follow the terms presented at the time of purchase and applicable consumer law.",
  },
  {
    title: "If you have cancelled a subscription",
    body:
      "Cancellation stops or schedules future recurring charges based on provider confirmation. It does not automatically establish whether any already collected payment is refundable.",
  },
] as const;

export default function RefundPolicy() {
  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / BILLING SUPPORT"
        title={
          <>
            Refunds, <em>clearly explained.</em>
          </>
        }
        description="An honest guide to raising payment questions and refund requests with DIPO LABS."
      />

      <section
        className="he-container he-section"
        aria-labelledby="refund-intro"
      >
        <div className="he-heading">
          <Eyebrow>PAYMENT CLARITY</Eyebrow>
          <h2 id="refund-intro">Know where you stand.</h2>
        </div>

        <div
          className="hb-workspace__note"
          role="note"
        >
          <ShieldCheck size={20} aria-hidden="true" />

          <span>
            <strong>Important pre-launch notice:</strong>{" "}
            HEYBIO's final paid refund eligibility rules,
            processing timelines and checkout disclosures
            have not been approved in the supplied project.
            This page explains how to request help; it does
            not replace finalized purchase terms. Paid
            checkout must not launch until those terms are
            settled and displayed before payment.
          </span>
        </div>

        <div
          style={{
            maxWidth: 820,
            display: "grid",
            gap: 22,
            marginTop: 28,
          }}
        >
          {items.map((item, index) => (
            <section
              key={item.title}
              style={{
                borderBottom: "1px solid #DEDEE3",
                paddingBottom: 22,
              }}
            >
              <span className="hb-workspace__eyebrow">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3
                style={{
                  margin: "10px 0",
                  fontSize: 22,
                  letterSpacing: "-.035em",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "#5F6067",
                  lineHeight: 1.75,
                }}
              >
                {item.body}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="he-surface he-section">
        <div
          className="he-container"
          style={{ maxWidth: 900 }}
        >
          <Eyebrow>DIRECT ASSISTANCE</Eyebrow>

          <h2
            style={{
              letterSpacing: "-.04em",
              fontSize: "clamp(26px, 4vw, 42px)",
            }}
          >
            <CreditCard size={27} aria-hidden="true" />
            Billing help from the HEYBIO team.
          </h2>

          <p
            style={{
              color: "#5F6067",
              lineHeight: 1.75,
            }}
          >
            Include the account email and payment
            reference. We will review your request
            against verified payment records and
            applicable rights. No specific response
            or refund deadline is promised here.
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
              href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Refund%20Request"
            >
              <Mail size={17} aria-hidden="true" />
              Email billing support
            </a>

            <a
              className="he-button he-button--secondary"
              href="/dashboard/payment-history"
            >
              Payment history
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </section>
    </EditorialLayout>
  );
}
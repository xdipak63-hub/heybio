
import type { MetaFunction } from "react-router";
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";
import {
  PLAN_LIST,
  planIncludesFeature,
  formatPlanPrice,
  type PlanFeature,
  type PlanId,
} from "../../lib/plans";
import "../../styles/heybio-pages.css";

export const meta: MetaFunction = () => [
  { title: "Pricing — HEYBIO | Start free" },
  {
    name: "description",
    content:
      "Compare HEYBIO Free, Pro, Premium and Pro Max monthly plans. See HYPE DROP eligibility and available features clearly.",
  },
];

const benefits: readonly {
  id: PlanFeature;
  label: string;
}[] = [
  {
    id: "public_profile",
    label: "Public HEYBIO profile",
  },
  {
    id: "basic_links",
    label: "Essential link management",
  },
  {
    id: "custom_themes",
    label: "Custom themes",
  },
  {
    id: "advanced_appearance",
    label: "Advanced appearance",
  },
  {
    id: "analytics",
    label: "Analytics entitlement*",
  },
  {
    id: "hype_drop",
    label: "HYPE DROP entitlement*",
  },
];

const faqs = [
  {
    q: "Can I start without paying?",
    a: "Yes. Free includes a public creator profile and essential link management. You can start without purchasing a subscription.",
  },
  {
    q: "Will paid plans renew automatically?",
    a: "Paid plans are designed for monthly recurring billing with your authorization. Renewal, pricing, tax and cancellation details must be confirmed at checkout before you subscribe.",
  },
  {
    q: "Which plans include HYPE DROP?",
    a: "Premium and Pro Max are eligible for HYPE DROP. Free and Pro do not include it. Access also requires an active, verified subscription and completion of the cross-product integration.",
  },
  {
    q: "What's the difference between Premium and Pro Max?",
    a: "The current published feature categories are the same. Additional Pro Max limits and benefits have not yet been defined in the product configuration. We won't invent benefits before they are confirmed.",
  },
] as const;

function PlanCard({ id }: { id: PlanId }) {
  const plan = PLAN_LIST.find(
    (item) => item.id === id
  );

  if (!plan) return null;

  const isFree = id === "free";
  const hasHype = planIncludesFeature(
    id,
    "hype_drop"
  );

  return (
    <article
      className={
        plan.featured
          ? "hp-plan hp-plan--featured hp-reveal"
          : "hp-plan hp-reveal"
      }
    >
      <div className="hp-plan__top">
        <span className="hp-plan__name">
          {plan.name}
        </span>

        {plan.featured && (
          <span className="hp-plan__tag">
            <Sparkles
              size={13}
              aria-hidden="true"
            />
            Featured
          </span>
        )}
      </div>

      <p className="hp-plan__description">
        {plan.description}
      </p>

      <div className="hp-plan__price">
        <strong>{formatPlanPrice(id)}</strong>
        <span>
          {isFree ? "forever" : "/ month"}
        </span>
      </div>

      {isFree ? (
        <a
          href="/signup"
          className="hp-btn hp-btn--ink hp-plan__action"
        >
          Start free
          <ArrowUpRight
            size={18}
            aria-hidden="true"
          />
        </a>
      ) : (
        <div
          className="hp-plan__pending"
          aria-label={`${plan.name} checkout is not available yet`}
        >
          Checkout not available yet
        </div>
      )}

      <div className="hp-plan__rule" />

      <p className="hp-plan__label">
        PLAN FEATURES
      </p>

      <ul className="hp-plan__features">
        {benefits
          .filter(
            (benefit) =>
              benefit.id !== "hype_drop" &&
              planIncludesFeature(id, benefit.id)
          )
          .map((benefit) => (
            <li key={benefit.id}>
              <Check
                size={17}
                aria-hidden="true"
              />
              {benefit.label}
            </li>
          ))}
      </ul>

      <div
        className={
          hasHype
            ? "hp-plan__hype hp-plan__hype--yes"
            : "hp-plan__hype"
        }
      >
        {hasHype ? (
          <Sparkles
            size={17}
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole
            size={17}
            aria-hidden="true"
          />
        )}

        {hasHype
          ? "HYPE DROP eligible*"
          : "HYPE DROP locked"}
      </div>
    </article>
  );
}

export default function PricingPage() {
  return (
    <div className="hp-page hp-pricing">
      <a className="hp-skip" href="#hp-main">
        Skip to content
      </a>

      <Navbar />

      <main id="hp-main">
        <section
          className="hp-section hp-pricing-hero hp-container"
          aria-labelledby="hp-title"
        >
          <span className="hp-kicker">
            <span className="hp-dot" />
            SIMPLE, CLEAR PRICING
          </span>

          <h1 id="hp-title">
            Start free.{" "}
            <span>Grow your way.</span>
          </h1>

          <p className="hp-lead">
            One link for everything you share.
            Find the plan that fits where you are today.
          </p>

          <span className="hp-pricing-hero__billing">
            All paid prices are in INR · Billed monthly
            when checkout is available
          </span>
        </section>

        <section
          className="hp-container hp-pricing-list"
          aria-label="HEYBIO subscription plans"
        >
          <div className="hp-plans">
            {PLAN_LIST.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
              />
            ))}
          </div>

          <div
            className="hp-pricing__notice"
            role="note"
          >
            <ShieldCheck
              size={22}
              aria-hidden="true"
            />

            <p>
              <strong>No surprise activation.</strong>{" "}
              Paid checkout is not yet available from
              this page. Paid access must only activate
              after verified payment and server-side
              entitlement checks. *Analytics
              functionality and HYPE DROP integration
              must be tested before being represented
              as live.
            </p>
          </div>
        </section>

        <section
          className="hp-section hp-section--soft"
          aria-labelledby="hp-compare-title"
        >
          <div className="hp-container">
            <div className="hp-section-head hp-reveal">
              <span className="hp-kicker">
                COMPARE AT A GLANCE
              </span>

              <h2 id="hp-compare-title">
                Know exactly{" "}
                <span>what's included.</span>
              </h2>

              <p>
                These are the feature entitlements
                defined in HEYBIO's current plan
                configuration, not a promise that every
                planned feature is already live.
              </p>
            </div>

            <div
              className="hp-table-scroll"
              role="region"
              aria-label="Plan feature comparison"
              tabIndex={0}
            >
              <table className="hp-comparison">
                <thead>
                  <tr>
                    <th scope="col">Feature</th>

                    {PLAN_LIST.map((plan) => (
                      <th
                        scope="col"
                        key={plan.id}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {benefits.map((benefit) => (
                    <tr key={benefit.id}>
                      <th scope="row">
                        {benefit.label}
                      </th>

                      {PLAN_LIST.map((plan) => (
                        <td key={plan.id}>
                          {planIncludesFeature(
                            plan.id,
                            benefit.id
                          ) ? (
                            <>
                              <Check
                                size={18}
                                aria-hidden="true"
                              />
                              <span className="hp-sr-only">
                                Included
                              </span>
                            </>
                          ) : (
                            <>
                              <X
                                size={17}
                                aria-hidden="true"
                              />
                              <span className="hp-sr-only">
                                Not included
                              </span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="hp-compare-note">
              * Entitlement does not automatically mean
              a feature is deployed or ready for every
              account. Premium and Pro Max currently
              have the same defined feature categories.
            </p>
          </div>
        </section>

        <section
          className="hp-section hp-container"
          aria-labelledby="hp-faq-title"
        >
          <div className="hp-pricing-faq">
            <div className="hp-pricing-faq__intro hp-reveal">
              <span className="hp-kicker">
                GOOD TO KNOW
              </span>

              <h2 id="hp-faq-title">
                Questions?{" "}
                <span>Clear answers.</span>
              </h2>

              <p>
                We'd rather explain exactly what
                is available than promise something
                that isn't ready.
              </p>

              <a
                className="hp-text-link"
                href="/contact"
              >
                Contact HEYBIO
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>
            </div>

            <div className="hp-pricing-faq__items">
              {faqs.map((faq) => (
                <details
                  className="hp-accordion"
                  key={faq.q}
                >
                  <summary>
                    <CircleHelp
                      size={19}
                      aria-hidden="true"
                    />
                    {faq.q}
                    <span aria-hidden="true">
                      +
                    </span>
                  </summary>

                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-final">
          <div className="hp-container hp-final__inner hp-reveal">
            <span className="hp-kicker">
              START YOUR WORLD
            </span>

            <h2>
              The best place to begin?{" "}
              <span>Right here.</span>
            </h2>

            <p>
              Claim your username, bring your links
              together and create something personal.
            </p>

            <a
              href="/signup"
              className="hp-btn hp-btn--lime"
            >
              Get started free
              <ArrowUpRight
                size={18}
                aria-hidden="true"
              />
            </a>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </div>
  );
}
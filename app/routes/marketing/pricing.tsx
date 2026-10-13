import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import Navbar from "../../components/marketing/Navbar";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Start your creator journey.",
    features: [
      "Your own HEYBIO username",
      "Public creator profile",
      "Essential link management",
      "Core profile customization",
    ],
    hype: false,
    popular: false,
    live: true,
  },
  {
    name: "Pro",
    price: "149",
    description: "For creators building momentum.",
    features: [
      "Everything in Free",
      "Additional customization",
      "Expanded creator tools",
      "More insights",
    ],
    hype: false,
    popular: false,
    live: false,
  },
  {
    name: "Premium",
    price: "249",
    description: "For your next big chapter.",
    features: [
      "Everything in Pro",
      "Premium profile experience",
      "Advanced creator features",
      "HYPE DROP eligibility",
    ],
    hype: true,
    popular: true,
    live: false,
  },
  {
    name: "Pro Max",
    price: "499",
    description: "For creators who want more.",
    features: [
      "Everything in Premium",
      "Maximum available customization",
      "Expanded analytics access",
      "HYPE DROP eligibility",
    ],
    hype: true,
    popular: false,
    live: false,
  },
] as const;

export function meta() {
  return [
    { title: "Plans & Pricing — HEYBIO" },
    {
      name: "description",
      content:
        "Explore HEYBIO Free, Pro, Premium and Pro Max plans.",
    },
  ];
}

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="hb-pricing-page">
        <div className="hb-container">
          <a href="/" className="hb-back-link">
            <ArrowLeft size={17} />
            Back to home
          </a>

          <div className="hb-pricing-heading">
            <span className="hb-eyebrow">
              SIMPLE. TRANSPARENT. YOURS.
            </span>

            <h1>
              Start free.
              <br />
              <span>Grow your way.</span>
            </h1>

            <p>
              Choose the space that fits your
              creativity. You can start with Free
              and explore upgrades later.
            </p>
          </div>

          <div className="hb-pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.popular
                    ? "hb-plan hb-plan--featured"
                    : "hb-plan"
                }
              >
                <div className="hb-plan__top">
                  <span>{plan.name}</span>
                  {plan.popular && (
                    <span className="hb-plan__popular">
                      <Sparkles size={13} />
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="hb-plan__price">
                  ₹{plan.price}
                  <span>/month</span>
                </div>

                <p>{plan.description}</p>

                <div className="hb-plan__divider" />

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={17} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="hb-plan__hype">
                  {plan.hype ? (
                    <>
                      <Sparkles size={17} />
                      HYPE DROP eligible
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={17} />
                      HYPE DROP not included
                    </>
                  )}
                </div>

                {plan.live ? (
                  <a
                    href="/signup"
                    className="hb-plan__button"
                  >
                    Get started free
                    <ArrowUpRight size={18} />
                  </a>
                ) : (
                  <div className="hb-plan__unavailable">
                    Checkout coming soon
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="hb-pricing-disclaimer">
            <LockKeyhole size={21} />
            <p>
              Paid plans are intended for recurring
              monthly billing with customer
              authorization. Taxes, renewal and
              cancellation terms must be shown at
              checkout. Paid checkout is not live yet;
              no paid benefits are activated without
              verified payment and server-side
              entitlement checks.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
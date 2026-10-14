
import { ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import {
  PLAN_LIST,
  formatPlanPrice,
  getHypeDropPlanEligibility,
  type PlanFeature
} from "../../lib/plans";

const featureNames: Record<PlanFeature, string> = {
  public_profile: "Personal HEYBIO profile",
  basic_links: "Essential link management",
  custom_themes: "Custom themes",
  advanced_appearance: "Advanced appearance",
  analytics: "Analytics",
  hype_drop: "HYPE DROP eligibility"
};

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="hm-section hm-pricing"
      aria-labelledby="hm-pricing-title"
    >
      <div className="hm-wrap">
        <div className="hm-section-head">
          <span className="hm-eyebrow">SIMPLE MONTHLY PRICING</span>
          <h2 id="hm-pricing-title">
            Start free. Grow your way.
          </h2>
          <p>
            Four plans for different stages of your creator journey.
          </p>
        </div>

        <div className="hm-pricing__grid">
          {PLAN_LIST.map((plan) => {
            const hype = getHypeDropPlanEligibility(plan.id);

            return (
              <article
                key={plan.id}
                className={`hm-price ${plan.featured ? "hm-price--featured" : ""}`}
              >
                <div className="hm-price__heading">
                  <h3>{plan.name}</h3>
                  {plan.featured && <span>FEATURED PLAN</span>}
                </div>

                <p>{plan.description}</p>

                <div className="hm-price__amount">
                  <strong>{formatPlanPrice(plan.id)}</strong>
                  <span>{plan.id === "free" ? "forever" : "/month"}</span>
                </div>

                <div className="hm-price__hype">
                  {hype ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <LockKeyhole size={16} aria-hidden="true" />
                  )}
                  HYPE DROP {hype ? "eligible" : "locked"}
                </div>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} aria-hidden="true" />
                      {featureNames[feature]}
                    </li>
                  ))}
                </ul>

                <a
                  className={`hm-button ${plan.featured ? "hm-button--lime" : "hm-button--dark"}`}
                  href={plan.id === "free" ? "/signup" : "/pricing"}
                >
                  {plan.id === "free" ? "Start free" : "Explore plan"}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>

        <p className="hm-pricing__note">
          Paid plans require payment authorization and verified billing
          status. HYPE DROP eligibility does not automatically grant
          access without an active eligible subscription.
        </p>
      </div>
    </section>
  );
}

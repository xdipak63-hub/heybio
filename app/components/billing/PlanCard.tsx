
import { Check, LockKeyhole, Sparkles } from "lucide-react";
import {
  PLANS,
  formatPlanPrice,
  getHypeDropPlanEligibility,
  type PlanId
} from "../../lib/plans";
import CheckoutButton from "./CheckoutButton";

type Props = {
  planId: PlanId;
  currentPlan?: PlanId;
  onSelectFree?: () => void;
  onVerificationPending?: () => void;
};

const featureLabels: Record<string, string> = {
  public_profile: "Your personal HEYBIO page",
  basic_links: "Share your important links",
  custom_themes: "Custom profile themes",
  advanced_appearance: "Advanced appearance controls",
  analytics: "Creator analytics",
  hype_drop: "HYPE DROP access"
};

export default function PlanCard({
  planId,
  currentPlan,
  onSelectFree,
  onVerificationPending
}: Props) {
  const plan = PLANS[planId];
  const current = currentPlan === planId;
  const hype = getHypeDropPlanEligibility(planId);

  return (
    <article
      className={`hb-plan-card ${plan.featured ? "hb-plan-card--featured" : ""}`}
      aria-label={`${plan.name} plan`}
    >
      <div className="hb-plan-card__top">
        <div>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
        </div>

        {plan.featured && (
          <span className="hb-plan-card__badge">
            <Sparkles size={13} aria-hidden="true" />
            Popular choice
          </span>
        )}
      </div>

      <div className="hb-plan-card__price">
        <strong>{formatPlanPrice(planId)}</strong>
        <span>{planId === "free" ? "forever" : "/ month"}</span>
      </div>

      <div className={`hb-plan-card__hype ${hype ? "is-included" : ""}`}>
        {hype ? (
          <Check size={17} aria-hidden="true" />
        ) : (
          <LockKeyhole size={16} aria-hidden="true" />
        )}
        HYPE DROP {hype ? "included" : "locked"}
      </div>

      <ul className="hb-plan-card__features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            <span>{featureLabels[feature]}</span>
          </li>
        ))}
      </ul>

      <div className="hb-plan-card__action">
        {current ? (
          <button className="hb-billing-button" disabled type="button">
            Current plan
          </button>
        ) : planId === "free" ? (
          <button
            className="hb-billing-button hb-billing-button--secondary"
            type="button"
            onClick={onSelectFree}
            disabled={!onSelectFree}
          >
            {onSelectFree ? "Continue with Free" : "Free plan"}
          </button>
        ) : (
          <CheckoutButton
            planId={planId}
            onVerificationPending={onVerificationPending}
          />
        )}
      </div>
    </article>
  );
}

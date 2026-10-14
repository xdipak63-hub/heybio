
import { Check, Minus } from "lucide-react";
import {
  PLAN_LIST,
  formatPlanPrice,
  planIncludesFeature,
  type PlanFeature
} from "../../lib/plans";

const rows: {
  feature: PlanFeature;
  label: string;
}[] = [
  { feature: "public_profile", label: "Public HEYBIO profile" },
  { feature: "basic_links", label: "Essential links" },
  { feature: "custom_themes", label: "Custom themes" },
  { feature: "advanced_appearance", label: "Advanced appearance" },
  { feature: "analytics", label: "Analytics" },
  { feature: "hype_drop", label: "HYPE DROP access" }
];

export default function PlanComparison() {
  return (
    <section className="hb-plan-comparison" aria-labelledby="hb-plan-compare-title">
      <div className="hb-plan-comparison__heading">
        <span className="hb-billing-eyebrow">COMPARE PLANS</span>
        <h2 id="hb-plan-compare-title">Find your perfect fit.</h2>
        <p>See exactly which features come with each HEYBIO plan.</p>
      </div>

      <div className="hb-plan-comparison__scroll" tabIndex={0} role="region" aria-label="Scrollable plan comparison">
        <table>
          <thead>
            <tr>
              <th scope="col">Features</th>
              {PLAN_LIST.map((plan) => (
                <th scope="col" key={plan.id}>
                  <strong>{plan.name}</strong>
                  <span>{formatPlanPrice(plan.id)}{plan.id !== "free" && "/mo"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.label}</th>
                {PLAN_LIST.map((plan) => {
                  const included = planIncludesFeature(plan.id, row.feature);
                  return (
                    <td key={plan.id}>
                      <span className="hb-plan-comparison__indicator">
                        {included ? (
                          <Check size={18} aria-label="Included" />
                        ) : (
                          <Minus size={18} aria-label="Not included" />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="hb-billing-fineprint">
        Features shown reflect the current plan definitions. Payment and access are subject to verified subscription status.
      </p>
    </section>
  );
}

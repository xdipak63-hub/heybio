export const PLAN_IDS = [
  "free",
  "pro",
  "premium",
  "pro_max"
] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export type PlanFeature =
  | "public_profile"
  | "basic_links"
  | "custom_themes"
  | "advanced_appearance"
  | "analytics"
  | "hype_drop";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPriceInr: number;
  currency: "INR";
  billingInterval: "month" | null;
  rank: number;
  featured: boolean;
  features: readonly PlanFeature[];
}

export const PLANS: Record<
  PlanId,
  Readonly<PlanDefinition>
> = {
  free: {
    id: "free",
    name: "Free",
    description: "Your world starts here.",
    monthlyPriceInr: 0,
    currency: "INR",
    billingInterval: null,
    rank: 0,
    featured: false,
    features: [
      "public_profile",
      "basic_links"
    ]
  },

  pro: {
    id: "pro",
    name: "Pro",
    description: "Create with more freedom.",
    monthlyPriceInr: 149,
    currency: "INR",
    billingInterval: "month",
    rank: 1,
    featured: false,
    features: [
      "public_profile",
      "basic_links",
      "custom_themes",
      "advanced_appearance"
    ]
  },

  premium: {
    id: "premium",
    name: "Premium",
    description: "Go beyond the ordinary.",
    monthlyPriceInr: 249,
    currency: "INR",
    billingInterval: "month",
    rank: 2,
    featured: true,
    features: [
      "public_profile",
      "basic_links",
      "custom_themes",
      "advanced_appearance",
      "analytics",
      "hype_drop"
    ]
  },

  pro_max: {
    id: "pro_max",
    name: "Pro Max",
    description: "Built for your next level.",
    monthlyPriceInr: 499,
    currency: "INR",
    billingInterval: "month",
    rank: 3,
    featured: false,
    features: [
      "public_profile",
      "basic_links",
      "custom_themes",
      "advanced_appearance",
      "analytics",
      "hype_drop"
    ]
  }
};

export const PLAN_LIST = PLAN_IDS.map(
  (id) => PLANS[id]
);

export function isPlanId(
  value: unknown
): value is PlanId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      PLANS,
      value
    )
  );
}

export function getPlan(
  value: unknown
): Readonly<PlanDefinition> {
  if (!isPlanId(value)) {
    throw new Error("Unknown HEYBIO plan.");
  }

  return PLANS[value];
}

export function formatPlanPrice(
  plan: PlanId
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(PLANS[plan].monthlyPriceInr);
}

export function planIncludesFeature(
  plan: PlanId,
  feature: PlanFeature
): boolean {
  return PLANS[plan].features.includes(feature);
}

export function comparePlans(
  left: PlanId,
  right: PlanId
): number {
  return PLANS[left].rank - PLANS[right].rank;
}

export function requiresPayment(
  plan: PlanId
): boolean {
  return PLANS[plan].monthlyPriceInr > 0;
}

export function getHypeDropPlanEligibility(
  plan: PlanId
): boolean {
  return planIncludesFeature(
    plan,
    "hype_drop"
  );
}
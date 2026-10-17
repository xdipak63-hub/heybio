import {
  getHypeDropPlanEligibility,
  isPlanId,
  planIncludesFeature,
  type PlanFeature,
  type PlanId
} from "../plans";

export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

export type VerifiedSubscription = {
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  verifiedByServer: boolean;
};

export type UserEntitlements = {
  effectivePlan: PlanId;
  features: ReadonlySet<PlanFeature>;
  hypeDropAllowed: boolean;
  paidSubscriptionActive: boolean;
};

const ALL_FEATURES: readonly PlanFeature[] = [
  "public_profile",
  "basic_links",
  "custom_themes",
  "advanced_appearance",
  "analytics",
  "hype_drop"
];

function hasValidPeriod(
  periodEnd: string | null,
  now: Date
): boolean {
  if (!periodEnd) {
    return false;
  }

  const end = new Date(periodEnd);

  return (
    !Number.isNaN(end.getTime()) &&
    end.getTime() > now.getTime()
  );
}

export function isPaidSubscriptionActive(
  subscription: VerifiedSubscription | null,
  userId: string,
  now: Date = new Date()
): boolean {
  if (!subscription) {
    return false;
  }

  if (
    subscription.userId !== userId ||
    subscription.verifiedByServer !== true ||
    subscription.planId === "free" ||
    subscription.status !== "active" && subscription.status !== "cancelled"
  ) {
    return false;
  }

  return hasValidPeriod(
    subscription.currentPeriodEnd,
    now
  );
}

export function resolveUserEntitlements(
  userId: string,
  subscription: VerifiedSubscription | null,
  now: Date = new Date()
): UserEntitlements {
  const paidSubscriptionActive =
    isPaidSubscriptionActive(
      subscription,
      userId,
      now
    );

  const effectivePlan: PlanId =
    paidSubscriptionActive &&
    subscription &&
    isPlanId(subscription.planId)
      ? subscription.planId
      : "free";

  const features = new Set<PlanFeature>(
    ALL_FEATURES.filter((feature) =>
      planIncludesFeature(
        effectivePlan,
        feature
      )
    )
  );

  return {
    effectivePlan,
    features,
    hypeDropAllowed:
      paidSubscriptionActive &&
      getHypeDropPlanEligibility(
        effectivePlan
      ),
    paidSubscriptionActive
  };
}

export function hasEntitlement(
  entitlements: UserEntitlements,
  feature: PlanFeature
): boolean {
  return entitlements.features.has(
    feature
  );
}

export function requireEntitlement(
  entitlements: UserEntitlements,
  feature: PlanFeature
): void {
  if (
    !hasEntitlement(
      entitlements,
      feature
    )
  ) {
    throw new Response(
      "Your current plan does not include this feature.",
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export function requireHypeDropAccess(
  entitlements: UserEntitlements
): void {
  if (!entitlements.hypeDropAllowed) {
    throw new Response(
      "HYPE DROP requires an active Premium or Pro Max subscription.",
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
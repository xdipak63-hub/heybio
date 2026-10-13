export const FEATURE_FLAGS = {
  publicProfiles: true,
  creatorDashboard: true,
  profileCustomization: true,

  advancedAnalytics: false,
  razorpayCheckout: false,
  subscriptionManagement: false,
  hypeDropIntegration: false,

  adminDashboard: false,
  creatorMarketplace: false
} as const;

export type FeatureFlag =
  keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(
  feature: FeatureFlag
): boolean {
  return FEATURE_FLAGS[feature] === true;
}

export function requireFeature(
  feature: FeatureFlag
): void {
  if (!isFeatureEnabled(feature)) {
    throw new Response(
      "This feature is not available.",
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export function getPublicFeatureFlags() {
  return {
    publicProfiles:
      FEATURE_FLAGS.publicProfiles,

    creatorDashboard:
      FEATURE_FLAGS.creatorDashboard,

    profileCustomization:
      FEATURE_FLAGS.profileCustomization,

    advancedAnalytics:
      FEATURE_FLAGS.advancedAnalytics,

    razorpayCheckout:
      FEATURE_FLAGS.razorpayCheckout,

    hypeDropIntegration:
      FEATURE_FLAGS.hypeDropIntegration
  };
}
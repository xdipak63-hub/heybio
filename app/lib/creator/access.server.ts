
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../supabase/admin.server";

import {
  getBillingAccess,
  type BillingAccess,
} from "../payments/subscriptions.server";

import {
  planIncludesFeature,
  type PlanFeature,
} from "../plans";

export type RestrictedCreatorFeature = Extract<
  PlanFeature,
  | "custom_themes"
  | "analytics"
  | "hype_drop"
  | "advanced_appearance"
>;

export type VerifiedFeatureAccess = {
  billing: BillingAccess;
  allowed: boolean;
};

/**
 * Use only after requireUser().
 *
 * Never accept userId directly from a browser form,
 * query string or unverified API response.
 *
 * A valid billing subscription AND a valid database
 * entitlement must both exist before allowing access.
 */
export async function getVerifiedFeatureAccess(
  context: unknown,
  supabase: SupabaseClient,
  userId: string,
  feature: RestrictedCreatorFeature,
): Promise<VerifiedFeatureAccess> {
  const env = getServerBindings(context);

  const admin = createSupabaseAdmin(env);

  const billing = await getBillingAccess(
    admin,
    userId,
  );

  if (
    !billing.active ||
    !planIncludesFeature(billing.plan, feature)
  ) {
    return {
      billing,
      allowed: false,
    };
  }

  const { data, error } = await supabase.rpc(
    "has_active_entitlement",
    {
      requested_feature: feature,
    },
  );

  if (error) {
    // Fail closed. A missing or broken entitlement
    // RPC must never grant paid access.
    throw new Error(
      `Unable to verify ${feature} entitlement.`,
    );
  }

  return {
    billing,
    allowed: data === true,
  };
}
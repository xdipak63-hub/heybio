
import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../supabase/admin.server";

import {
  getBillingAccess,
} from "../payments/subscriptions.server";

import {
  planIncludesFeature,
} from "../plans";

import {
  deviceCategory,
  type IncomingAnalyticsEvent,
} from "./privacy.server";

/**
 * Server-only analytics recorder.
 *
 * Never accept a profile ID or metric count
 * from the public browser.
 *
 * Public visitors submit:
 * - event
 * - username
 * - optional linkId
 *
 * The backend establishes real ownership.
 */
export async function recordAnalyticsEvent(
  context: unknown,
  request: Request,
  event: IncomingAnalyticsEvent,
): Promise<void> {
  const db: SupabaseClient =
    createSupabaseAdmin(
      getServerBindings(context),
    );

  // Resolve only an active public profile.
  const {
    data: profile,
    error: profileError,
  } = await db
    .from("profiles")
    .select("id")
    .eq("username", event.username)
    .eq("account_status", "active")
    .maybeSingle();

  if (profileError) {
    throw new Error(
      "Profile resolution failed",
    );
  }

  if (!profile) {
    return;
  }

  // Subscription must be active and verified
  // through the existing server billing system.
  const billing =
    await getBillingAccess(
      db,
      profile.id,
    );

  if (
    !billing.active ||
    !billing.subscriptionId ||
    !planIncludesFeature(
      billing.plan,
      "analytics",
    )
  ) {
    return;
  }

  // Additionally require the entitlement record
  // to be unrevoked and within its time window.
  const currentTime =
    new Date().toISOString();

  const {
    data: entitlement,
    error: entitlementError,
  } = await db
    .from("entitlements")
    .select("id")
    .eq("user_id", profile.id)
    .eq(
      "subscription_id",
      billing.subscriptionId,
    )
    .eq("feature_key", "analytics")
    .is("revoked_at", null)
    .lte("starts_at", currentTime)
    .gt("expires_at", currentTime)
    .limit(1)
    .maybeSingle();

  if (entitlementError) {
    throw new Error(
      "Entitlement verification failed",
    );
  }

  if (!entitlement) {
    return;
  }

  if (event.event === "link_click") {
    // Never count an inactive link or a link
    // belonging to a different creator.
    const {
      data: link,
      error: linkError,
    } = await db
      .from("links")
      .select("id")
      .eq("id", event.linkId!)
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .maybeSingle();

    if (linkError) {
      throw new Error(
        "Link validation failed",
      );
    }

    if (!link) {
      return;
    }
  }

  // No raw IP, referrer URL, device fingerprint,
  // cookie identifier, or user-agent is stored.
  const { error: insertError } = await db
    .from("analytics_events")
    .insert({
      profile_id: profile.id,
      link_id: event.linkId,
      event_type: event.event,
      device_category:
        deviceCategory(request),
      referrer_domain: null,
      country_code: null,
    });

  if (insertError) {
    throw new Error(
      "Analytics event could not be written",
    );
  }
}
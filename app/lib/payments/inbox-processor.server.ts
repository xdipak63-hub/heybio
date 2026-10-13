import type {
  SupabaseClient
} from "@supabase/supabase-js";

import {
  createRazorpayClient,
  type RazorpayBindings
} from "./razorpay.server";

import {
  extractSubscriptionId,
  parseProviderSubscription,
  unixSecondsToIso
} from "./settlement-types";

interface ClaimedEvent {
  id: string;
  lease_token: string;
  provider_event_id: string;
  event_type: string;
  payload: unknown;
  attempts: number;
}

export interface InboxBatchResult {
  claimed: number;
  processed: number;
  failed: number;
}

export async function processBillingInbox(
  db: SupabaseClient,
  env: RazorpayBindings,
  batchSize = 10
): Promise<InboxBatchResult> {
  if (
    !Number.isInteger(batchSize) ||
    batchSize < 1 ||
    batchSize > 50
  ) {
    throw new Error("Invalid batch size");
  }

  const { data, error } = await db.rpc(
    "claim_razorpay_events",
    { p_limit: batchSize }
  );

  if (error) {
    throw new Error(
      `Unable to claim billing events: ${error.code}`
    );
  }

  const events = (data ?? []) as ClaimedEvent[];
  const razorpay = createRazorpayClient(env);

  const result: InboxBatchResult = {
    claimed: events.length,
    processed: 0,
    failed: 0
  };

  for (const event of events) {
    let success = false;
    let failure: string | null = null;

    try {
      const subscriptionId = extractSubscriptionId(
        event.payload
      );

      if (!subscriptionId) {
        throw new Error(
          "Event has no supported subscription reference"
        );
      }

      const provider = parseProviderSubscription(
        await razorpay.getSubscription(subscriptionId)
      );

      if (provider.id !== subscriptionId) {
        throw new Error(
          "Provider subscription mismatch"
        );
      }

      const { data: local, error: lookupError } =
        await db
          .from("subscriptions")
          .select("id, razorpay_plan_id")
          .eq(
            "razorpay_subscription_id",
            subscriptionId
          )
          .maybeSingle();

      if (lookupError || !local) {
        throw new Error(
          "Subscription not registered locally"
        );
      }

      if (
        local.razorpay_plan_id !== provider.plan_id
      ) {
        throw new Error(
          "Provider plan mismatch"
        );
      }

      const { error: settlementError } = await db.rpc(
        "settle_razorpay_subscription",
        {
          p_razorpay_subscription_id: provider.id,
          p_razorpay_plan_id: provider.plan_id,
          p_provider_status: provider.status,
          p_period_start: unixSecondsToIso(
            provider.current_start
          ),
          p_period_end: unixSecondsToIso(
            provider.current_end
          )
        }
      );

      if (settlementError) {
        throw new Error(
          `Settlement failed: ${settlementError.code}`
        );
      }

      success = true;
    } catch (error) {
      failure = error instanceof Error
        ? error.message.slice(0, 500)
        : "Unknown settlement failure";
    }

    const { data: finished, error: finishError } =
      await db.rpc("finish_razorpay_event", {
        p_id: event.id,
        p_lease_token: event.lease_token,
        p_success: success,
        p_error: failure
      });

    if (finishError || finished !== true) {
      console.error(
        "Billing event lease finalization failed",
        event.id
      );

      result.failed++;
      continue;
    }

    if (success) {
      result.processed++;
    } else {
      result.failed++;
    }
  }

  return result;
}
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RazorpayBindings } from "./razorpay.server";
import { extractSubscriptionId } from "./settlement-types";
import { reconcileProviderPayment, reconcileProviderSubscription } from "./verified-settlement.server";

interface ClaimedEvent {
  id: string;
  lease_token: string;
  provider_event_id: string;
  event_type: string;
  payload: unknown;
  attempts: number;
}
export interface InboxBatchResult { claimed: number; processed: number; failed: number; }

function paymentIdFromEvent(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = (payload as { payload?: { payment?: { entity?: { id?: unknown } } } }).payload;
  const id = envelope?.payment?.entity?.id;
  return typeof id === "string" && /^pay_[A-Za-z0-9]+$/.test(id) ? id : null;
}

export async function processBillingInbox(
  db: SupabaseClient, env: RazorpayBindings, batchSize = 10
): Promise<InboxBatchResult> {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 50) throw new Error("Invalid batch size");
  const { data, error } = await db.rpc("claim_razorpay_events", { p_limit: batchSize });
  if (error) throw new Error(`Unable to claim billing events: ${error.code}`);
  const events = (data ?? []) as ClaimedEvent[];
  const result: InboxBatchResult = { claimed: events.length, processed: 0, failed: 0 };
  for (const event of events) {
    let success = false;
    let failure: string | null = null;
    try {
      // Only events capable of changing billing state trigger a provider lookup.
      if (["payment.captured", "subscription.activated", "subscription.charged",
        "subscription.pending", "subscription.halted", "subscription.cancelled",
        "subscription.completed", "subscription.authenticated", "subscription.paused",
        "subscription.resumed", "payment.failed"].includes(event.event_type)) {
        const subscriptionId = extractSubscriptionId(event.payload);
        const paymentId = paymentIdFromEvent(event.payload);
        if (subscriptionId) {
          const { data: known, error } = await db.from("subscriptions")
            .select("id").eq("razorpay_subscription_id", subscriptionId).maybeSingle();
          if (error) throw new Error(`Unable to resolve subscription: ${error.code}`);
          if (known) await reconcileProviderSubscription(db, env, subscriptionId);
        }
        if (paymentId) await reconcileProviderPayment(db, env, paymentId);
        // Unrelated merchant events do not belong to a HEYBIO order and are ignored.
      }
      success = true;
    } catch (err) {
      failure = err instanceof Error ? err.message.slice(0, 500) : "Unknown billing failure";
    }
    const { data: finished, error: finishError } = await db.rpc("finish_razorpay_event", {
      p_id: event.id, p_lease_token: event.lease_token,
      p_success: success, p_error: failure
    });
    if (finishError || finished !== true) {
      console.error("Billing event lease finalization failed", event.id);
      result.failed++;
    } else if (success) result.processed++;
    else result.failed++;
  }
  return result;
}

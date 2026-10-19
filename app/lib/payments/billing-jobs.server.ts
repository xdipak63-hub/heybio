import {
  createSupabaseAdmin
} from "../supabase/admin.server";

import {
  processBillingInbox,
  type InboxBatchResult
} from "./inbox-processor.server";

export interface BillingJobBindings {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  BILLING_JOBS_ENABLED?: string;
}

export interface BillingJobResult {
  enabled: boolean;
  batches: number;
  claimed: number;
  processed: number;
  failed: number;
}

export async function runBillingJobs(
  env: BillingJobBindings
): Promise<BillingJobResult> {
  if (env.BILLING_JOBS_ENABLED !== "true") {
    return {
      enabled: false,
      batches: 0,
      claimed: 0,
      processed: 0,
      failed: 0
    };
  }

  const required: Array<keyof BillingJobBindings> = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET"
  ];

  for (const key of required) {
    if (!env[key]?.trim()) {
      throw new Error(
        `Billing job binding missing: ${key}`
      );
    }
  }

  const db = createSupabaseAdmin(env);

  const summary: BillingJobResult = {
    enabled: true,
    batches: 0,
    claimed: 0,
    processed: 0,
    failed: 0
  };

  // Bounded processing per scheduled invocation.
  for (let batch = 0; batch < 3; batch++) {
    const result: InboxBatchResult =
      await processBillingInbox(
        db,
        env,
        10
      );

    summary.batches++;
    summary.claimed += result.claimed;
    summary.processed += result.processed;
    summary.failed += result.failed;

    if (result.claimed < 10) {
      break;
    }
  }

  // Free the single open-order slot of users who never completed checkout.
  const { error: expiryError } = await db.rpc("expire_stale_manual_orders");
  if (expiryError) {
    console.warn("Stale manual order cleanup failed", expiryError.code);
  }

  if (summary.failed > 0) {
    console.warn(
      "Billing jobs completed with failed events",
      {
        failed: summary.failed,
        processed: summary.processed
      }
    );
  }

  return summary;
}
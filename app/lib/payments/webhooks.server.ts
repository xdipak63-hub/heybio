import type {
  SupabaseClient
} from "@supabase/supabase-js";

import {
  verifyWebhookSignature
} from "./verify-signature.server";

export interface WebhookResult {
  accepted: boolean;
  duplicate: boolean;
  status: string;
}

const MAX_WEBHOOK_BYTES = 512_000;

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function processRazorpayWebhook(
  db: SupabaseClient,
  rawBody: string,
  signature: string | null,
  eventId: string | null,
  webhookSecret: string
): Promise<WebhookResult> {
  const size = new TextEncoder()
    .encode(rawBody).byteLength;

  if (
    size === 0 ||
    size > MAX_WEBHOOK_BYTES
  ) {
    throw new Response(
      "Invalid webhook size",
      { status: 413 }
    );
  }

  const verified =
    await verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

  if (!verified) {
    throw new Response(
      "Invalid webhook signature",
      { status: 401 }
    );
  }

  if (
    !eventId ||
    eventId.length > 200
  ) {
    throw new Response(
      "Missing event ID",
      { status: 400 }
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new Response(
      "Invalid webhook JSON",
      { status: 400 }
    );
  }

  if (
    !isObject(parsed) ||
    typeof parsed.event !== "string" ||
    parsed.event.length === 0 ||
    parsed.event.length > 160
  ) {
    throw new Response(
      "Invalid webhook event",
      { status: 400 }
    );
  }

  const { data, error } = await db.rpc(
    "enqueue_razorpay_event",
    {
      p_event_id: eventId,
      p_event_type: parsed.event,
      p_payload: parsed
    }
  );

  if (error) {
    console.error(
      "Razorpay inbox error",
      error.code
    );

    throw new Response(
      "Webhook storage unavailable",
      { status: 503 }
    );
  }

  const result = data as {
    accepted?: boolean;
    duplicate?: boolean;
    status?: string;
  } | null;

  if (result?.accepted !== true) {
    throw new Response(
      "Webhook not accepted",
      { status: 503 }
    );
  }

  return {
    accepted: true,
    duplicate:
      result.duplicate === true,
    status: result.status ?? "pending"
  };
}
import type {
  ActionFunctionArgs
} from "react-router";

import {
  createSupabaseAdmin,
  getServerBindings
} from "../../lib/supabase/admin.server";

import {
  processRazorpayWebhook
} from "../../lib/payments/webhooks.server";

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const env = getServerBindings(context);

  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return Response.json(
      { error: "Webhook unavailable" },
      { status: 503 }
    );
  }

  const length = Number(
    request.headers.get("content-length")
  );

  if (
    Number.isFinite(length) &&
    length > 512_000
  ) {
    return Response.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  // Read a bounded byte stream; Content-Length may be absent or forged.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Empty webhook" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 512_000) {
      await reader.cancel().catch(() => {});
      return Response.json({ error: "Webhook payload too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  const data = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  let rawBody: string;
  try { rawBody = new TextDecoder("utf-8", { fatal: true }).decode(data); }
  catch { return Response.json({ error: "Invalid encoding" }, { status: 400 }); }

  const signature = request.headers.get(
    "x-razorpay-signature"
  );

  const eventId = request.headers.get(
    "x-razorpay-event-id"
  );

  const db = createSupabaseAdmin(env);

  try {
    const result =
      await processRazorpayWebhook(
        db,
        rawBody,
        signature,
        eventId,
        env.RAZORPAY_WEBHOOK_SECRET
      );

    return Response.json(
      {
        ok: result.accepted,
        duplicate: result.duplicate
      },
      {
        status: result.accepted
          ? 200
          : 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(
      "Unhandled Razorpay webhook failure"
    );

    return Response.json(
      { error: "Processing failed" },
      { status: 503 }
    );
  }
}

export function loader() {
  return new Response(
    "Method not allowed",
    {
      status: 405,
      headers: {
        Allow: "POST"
      }
    }
  );
}
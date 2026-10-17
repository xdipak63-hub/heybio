const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) =>
      value.toString(16).padStart(2, "0")
    )
    .join("");
}

async function signHmac(
  message: string,
  secret: string
): Promise<string> {
  if (!secret.trim()) {
    throw new Error(
      "Payment signature secret is missing."
    );
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const result = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  return toHex(new Uint8Array(result));
}

function constantTimeCompare(
  expected: string,
  received: string
): boolean {
  if (
    !/^[a-f0-9]{64}$/i.test(received)
  ) {
    return false;
  }

  const normalized = received.toLowerCase();

  let difference =
    expected.length ^ normalized.length;

  const count = Math.max(
    expected.length,
    normalized.length
  );

  for (let i = 0; i < count; i++) {
    difference |=
      (expected.charCodeAt(i) || 0) ^
      (normalized.charCodeAt(i) || 0);
  }

  return difference === 0;
}

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (
    !signature ||
    !rawBody ||
    !secret
  ) {
    return false;
  }

  const expected = await signHmac(
    rawBody,
    secret
  );

  return constantTimeCompare(
    expected,
    signature
  );
}

export interface CheckoutSignatureInput {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
  secret: string;
}

export async function verifySubscriptionCheckoutSignature(
  input: CheckoutSignatureInput
): Promise<boolean> {
  if (
    !/^pay_[A-Za-z0-9]+$/.test(
      input.razorpayPaymentId
    ) ||
    !/^sub_[A-Za-z0-9]+$/.test(
      input.razorpaySubscriptionId
    )
  ) {
    return false;
  }

  const expected = await signHmac(
    `${input.razorpayPaymentId}|${input.razorpaySubscriptionId}`,
    input.secret
  );

  return constantTimeCompare(
    expected,
    input.razorpaySignature
  );
}
/** Order ID must be loaded from the user's server-side order record. */
export async function verifyOrderCheckoutSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  secret: string;
}): Promise<boolean> {
  if (!/^order_[A-Za-z0-9]+$/.test(input.razorpayOrderId) ||
      !/^pay_[A-Za-z0-9]+$/.test(input.razorpayPaymentId)) return false;
  const signature = await signHmac(
    `${input.razorpayOrderId}|${input.razorpayPaymentId}`, input.secret
  );
  return constantTimeCompare(signature, input.razorpaySignature);
}

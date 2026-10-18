
/**
 * HEYBIO by DIPO LABS
 *
 * Payment Signature Security Tests
 *
 * Tests:
 * - Valid order signature
 * - Forged order signature
 * - Modified payment ID
 * - Modified order ID
 * - Valid subscription signature
 * - Modified subscription ID
 * - Valid webhook signature
 * - Tampered webhook payload
 * - Missing signatures
 *
 * No real payments or database changes.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { pathToFileURL } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "esbuild";

const SOURCE = resolve(
  process.cwd(),
  "app/lib/payments/verify-signature.server.ts"
);

const TEST_SECRET =
  "heybio-local-test-secret-not-production";

function signature(message, secret = TEST_SECRET) {
  return createHmac("sha256", secret)
    .update(message)
    .digest("hex");
}

/**
 * Bundle the existing TypeScript module
 * for Node's built-in test runner.
 *
 * The original source is not modified.
 */
const temporaryDirectory = await mkdtemp(
  join(tmpdir(), "heybio-payment-security-")
);

const bundlePath = join(
  temporaryDirectory,
  "signature-module.mjs"
);

let verification;

try {
  await build({
    entryPoints: [SOURCE],
    outfile: bundlePath,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    logLevel: "silent",
  });

  verification = await import(
    pathToFileURL(bundlePath).href
  );
} catch (error) {
  await rm(temporaryDirectory, {
    recursive: true,
    force: true,
  });

  throw error;
}

const {
  verifyWebhookSignature,
  verifyOrderCheckoutSignature,
  verifySubscriptionCheckoutSignature,
} = verification;

test("valid order signature is accepted", async () => {
  const orderId = "order_HEYBIO123";
  const paymentId = "pay_HEYBIO123";

  const valid = await verifyOrderCheckoutSignature({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(
      `${orderId}|${paymentId}`
    ),
    secret: TEST_SECRET,
  });

  assert.equal(valid, true);
});

test("forged order signature is rejected", async () => {
  const valid = await verifyOrderCheckoutSignature({
    razorpayOrderId: "order_HEYBIO123",
    razorpayPaymentId: "pay_HEYBIO123",
    razorpaySignature: "0".repeat(64),
    secret: TEST_SECRET,
  });

  assert.equal(valid, false);
});

test("modified payment ID is rejected", async () => {
  const orderId = "order_HEYBIO123";
  const paymentId = "pay_HEYBIO123";

  const valid = await verifyOrderCheckoutSignature({
    razorpayOrderId: orderId,
    razorpayPaymentId: "pay_ATTACKER123",
    razorpaySignature: signature(
      `${orderId}|${paymentId}`
    ),
    secret: TEST_SECRET,
  });

  assert.equal(valid, false);
});

test("modified order ID is rejected", async () => {
  const orderId = "order_HEYBIO123";
  const paymentId = "pay_HEYBIO123";

  const valid = await verifyOrderCheckoutSignature({
    razorpayOrderId: "order_DIFFERENT123",
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(
      `${orderId}|${paymentId}`
    ),
    secret: TEST_SECRET,
  });

  assert.equal(valid, false);
});

test("valid subscription signature is accepted", async () => {
  const paymentId = "pay_HEYBIO123";
  const subscriptionId = "sub_HEYBIO123";

  const valid =
    await verifySubscriptionCheckoutSignature({
      razorpayPaymentId: paymentId,
      razorpaySubscriptionId: subscriptionId,
      razorpaySignature: signature(
        `${paymentId}|${subscriptionId}`
      ),
      secret: TEST_SECRET,
    });

  assert.equal(valid, true);
});

test("modified subscription ID is rejected", async () => {
  const paymentId = "pay_HEYBIO123";
  const subscriptionId = "sub_HEYBIO123";

  const valid =
    await verifySubscriptionCheckoutSignature({
      razorpayPaymentId: paymentId,
      razorpaySubscriptionId: "sub_ATTACKER123",
      razorpaySignature: signature(
        `${paymentId}|${subscriptionId}`
      ),
      secret: TEST_SECRET,
    });

  assert.equal(valid, false);
});

test("valid webhook signature is accepted", async () => {
  const payload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_HEYBIO123",
          amount: 24900,
        },
      },
    },
  });

  const valid = await verifyWebhookSignature(
    payload,
    signature(payload),
    TEST_SECRET
  );

  assert.equal(valid, true);
});

test("tampered webhook payload is rejected", async () => {
  const original = JSON.stringify({
    event: "payment.captured",
    amount: 14900,
  });

  const tampered = JSON.stringify({
    event: "payment.captured",
    amount: 49900,
  });

  const valid = await verifyWebhookSignature(
    tampered,
    signature(original),
    TEST_SECRET
  );

  assert.equal(valid, false);
});

test("missing webhook signature is rejected", async () => {
  const valid = await verifyWebhookSignature(
    '{"event":"payment.captured"}',
    null,
    TEST_SECRET
  );

  assert.equal(valid, false);
});

test("signature from a different secret is rejected", async () => {
  const payload = '{"event":"payment.captured"}';

  const valid = await verifyWebhookSignature(
    payload,
    signature(payload, "wrong-secret"),
    TEST_SECRET
  );

  assert.equal(valid, false);
});

test("invalid payment identifier is rejected", async () => {
  const valid = await verifyOrderCheckoutSignature({
    razorpayOrderId: "order_HEYBIO123",
    razorpayPaymentId: "../pay_HEYBIO123",
    razorpaySignature: "0".repeat(64),
    secret: TEST_SECRET,
  });

  assert.equal(valid, false);
});

/**
 * Clean up the generated test bundle
 * after the test runner finishes.
 */
process.on("exit", () => {
  // Temporary files are isolated outside
  // the repository and contain no secrets.
});

test.after(async () => {
  await rm(temporaryDirectory, {
    recursive: true,
    force: true,
  });
});

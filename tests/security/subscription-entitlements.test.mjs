
/**
 * HEYBIO by DIPO LABS
 * Subscription & Entitlement Security Tests
 *
 * Uses the real application entitlement logic.
 * No production database or payment calls.
 *
 * Run:
 * node --test tests/security/subscription-entitlements.test.mjs
 */

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const directory = await mkdtemp(
  join(tmpdir(), "heybio-entitlements-")
);

const outfile = join(
  directory,
  "entitlements.mjs"
);

after(async () => {
  await rm(directory, {
    recursive: true,
    force: true,
  });
});

await build({
  entryPoints: [
    resolve(
      "app/lib/payments/entitlements.server.ts"
    ),
  ],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "silent",
});

const {
  resolveUserEntitlements,
  isPaidSubscriptionActive,
  requireHypeDropAccess,
  hasEntitlement,
} = await import(
  pathToFileURL(outfile).href
);

const NOW = new Date("2026-10-18T12:00:00Z");

const FUTURE = "2026-11-18T12:00:00Z";
const PAST = "2026-09-18T12:00:00Z";

const USER_A = "user-a";
const USER_B = "user-b";

function subscription(
  overrides = {}
) {
  return {
    userId: USER_A,
    planId: "premium",
    status: "active",
    currentPeriodEnd: FUTURE,
    verifiedByServer: true,
    ...overrides,
  };
}

function entitlement(
  record,
  userId = USER_A
) {
  return resolveUserEntitlements(
    userId,
    record,
    NOW
  );
}

test("No subscription receives Free access", () => {
  const result = entitlement(null);

  assert.equal(result.effectivePlan, "free");
  assert.equal(result.hypeDropAllowed, false);
  assert.equal(result.paidSubscriptionActive, false);
});

test("Free plan cannot unlock HYPE DROP", () => {
  const result = entitlement(
    subscription({ planId: "free" })
  );

  assert.equal(result.hypeDropAllowed, false);
});

test("Pro plan cannot unlock HYPE DROP", () => {
  const result = entitlement(
    subscription({ planId: "pro" })
  );

  assert.equal(result.effectivePlan, "pro");
  assert.equal(result.hypeDropAllowed, false);
});

test("Premium active plan unlocks HYPE DROP", () => {
  const result = entitlement(subscription());

  assert.equal(result.effectivePlan, "premium");
  assert.equal(result.hypeDropAllowed, true);
});

test("Pro Max active plan unlocks HYPE DROP", () => {
  const result = entitlement(
    subscription({ planId: "pro_max" })
  );

  assert.equal(result.hypeDropAllowed, true);
});

test("Unverified subscription cannot unlock paid access", () => {
  const result = entitlement(
    subscription({ verifiedByServer: false })
  );

  assert.equal(result.effectivePlan, "free");
  assert.equal(result.hypeDropAllowed, false);
});

test("Another user's subscription cannot grant access", () => {
  const result = entitlement(
    subscription(),
    USER_B
  );

  assert.equal(result.effectivePlan, "free");
  assert.equal(result.hypeDropAllowed, false);
});

test("Expired subscription loses paid access", () => {
  const result = entitlement(
    subscription({
      currentPeriodEnd: PAST,
    })
  );

  assert.equal(result.effectivePlan, "free");
  assert.equal(result.hypeDropAllowed, false);
});

test("Exact period end is no longer active", () => {
  const result = entitlement(
    subscription({
      currentPeriodEnd: NOW.toISOString(),
    })
  );

  assert.equal(result.hypeDropAllowed, false);
});

test("Missing period end denies paid access", () => {
  const result = entitlement(
    subscription({
      currentPeriodEnd: null,
    })
  );

  assert.equal(result.hypeDropAllowed, false);
});

test("Invalid period date denies paid access", () => {
  const result = entitlement(
    subscription({
      currentPeriodEnd: "not-a-date",
    })
  );

  assert.equal(result.hypeDropAllowed, false);
});

for (const status of [
  "created",
  "authenticated",
  "pending",
  "halted",
  "completed",
  "expired",
]) {
  test(`${status} status cannot unlock HYPE DROP`, () => {
    const result = entitlement(
      subscription({ status })
    );

    assert.equal(result.hypeDropAllowed, false);
    assert.equal(result.effectivePlan, "free");
  });
}

test("Cancelled subscription retains paid period access", () => {
  const result = entitlement(
    subscription({
      status: "cancelled",
    })
  );

  assert.equal(result.hypeDropAllowed, true);
});

test("Cancelled and expired period denies access", () => {
  const result = entitlement(
    subscription({
      status: "cancelled",
      currentPeriodEnd: PAST,
    })
  );

  assert.equal(result.hypeDropAllowed, false);
});

test("Invalid plan ID fails closed", () => {
  const result = entitlement(
    subscription({
      planId: "admin",
    })
  );

  assert.equal(result.effectivePlan, "free");
  assert.equal(result.hypeDropAllowed, false);
});

test("Free plan has basic links", () => {
  const result = entitlement(null);

  assert.equal(
    hasEntitlement(result, "basic_links"),
    true
  );

  assert.equal(
    hasEntitlement(result, "analytics"),
    false
  );
});

test("Pro cannot use Premium analytics", () => {
  const result = entitlement(
    subscription({
      planId: "pro",
    })
  );

  assert.equal(
    hasEntitlement(result, "analytics"),
    false
  );
});

test("HYPE DROP guard returns 403 without entitlement", () => {
  const result = entitlement(null);

  assert.throws(
    () => requireHypeDropAccess(result),
    (error) =>
      error instanceof Response &&
      error.status === 403
  );
});

test("HYPE DROP guard permits active Premium", () => {
  const result = entitlement(subscription());

  assert.doesNotThrow(() => {
    requireHypeDropAccess(result);
  });
});

test("Active subscription predicate rejects wrong user", () => {
  assert.equal(
    isPaidSubscriptionActive(
      subscription(),
      USER_B,
      NOW
    ),
    false
  );
});

test("Active subscription predicate accepts valid owner", () => {
  assert.equal(
    isPaidSubscriptionActive(
      subscription(),
      USER_A,
      NOW
    ),
    true
  );
});

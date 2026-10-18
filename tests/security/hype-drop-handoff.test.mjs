
/**
 * HEYBIO by DIPO LABS
 * HYPE DROP Handoff Security Tests
 *
 * Tests the real token verifier.
 *
 * No live credentials, database,
 * payment calls or external network.
 *
 * Run:
 * node --test tests/security/hype-drop-handoff.test.mjs
 */

import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  createHmac,
  randomUUID,
  webcrypto,
} from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const SECRET =
  "heybio-hype-drop-local-test-secret-2026-only";

const NOW = 1_800_000_000;

const directory = await mkdtemp(
  join(tmpdir(), "heybio-handoff-test-")
);

after(async () => {
  await rm(directory, {
    recursive: true,
    force: true,
  });
});

const outfile = join(
  directory,
  "hype-drop.mjs"
);

await build({
  entryPoints: [
    resolve(
      "app/lib/integrations/hype-drop.server.ts"
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
  verifyHypeDropHandoff,
} = await import(
  pathToFileURL(outfile).href
);

function encode(value) {
  return Buffer.from(
    JSON.stringify(value),
    "utf8"
  ).toString("base64url");
}

function claims(overrides = {}) {
  return {
    iss: "heybio",
    aud: "hype-drop",
    sub: randomUUID(),
    plan: "premium",
    iat: NOW,
    nbf: NOW,
    exp: NOW + 90,
    jti: randomUUID(),
    ...overrides,
  };
}

function sign(
  payload = claims(),
  secret = SECRET,
  header = {
    alg: "HS256",
    typ: "JWT",
  }
) {
  const signingInput = [
    encode(header),
    encode(payload),
  ].join(".");

  const signature = createHmac(
    "sha256",
    secret
  )
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

async function accepted(token, now = NOW) {
  return verifyHypeDropHandoff(
    token,
    SECRET,
    now
  );
}

test("valid Premium token is accepted", async () => {
  const result = await accepted(
    sign(claims())
  );

  assert.equal(result?.plan, "premium");
  assert.equal(result?.aud, "hype-drop");
});

test("valid Pro Max token is accepted", async () => {
  const result = await accepted(
    sign(claims({
      plan: "pro_max",
    }))
  );

  assert.equal(result?.plan, "pro_max");
});

for (const plan of [
  "free",
  "pro",
  "admin",
  "",
]) {
  test(`${plan || "empty"} plan rejected`, async () => {
    const result = await accepted(
      sign(claims({ plan }))
    );

    assert.equal(result, null);
  });
}

test("wrong audience is rejected", async () => {
  const result = await accepted(
    sign(claims({
      aud: "heybio-admin",
    }))
  );

  assert.equal(result, null);
});

test("wrong issuer is rejected", async () => {
  const result = await accepted(
    sign(claims({
      iss: "attacker",
    }))
  );

  assert.equal(result, null);
});

test("modified payload is rejected", async () => {
  const token = sign(claims());

  const parts = token.split(".");

  const payload = JSON.parse(
    Buffer.from(
      parts[1],
      "base64url"
    ).toString("utf8")
  );

  payload.plan = "pro_max";

  parts[1] = encode(payload);

  const result = await accepted(
    parts.join(".")
  );

  assert.equal(result, null);
});

test("wrong signing secret is rejected", async () => {
  const token = sign(
    claims(),
    "different-test-secret-123456789012345"
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("none algorithm is rejected", async () => {
  const token = sign(
    claims(),
    SECRET,
    {
      alg: "none",
      typ: "JWT",
    }
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("wrong token type is rejected", async () => {
  const token = sign(
    claims(),
    SECRET,
    {
      alg: "HS256",
      typ: "CUSTOM",
    }
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("expired token is rejected", async () => {
  const token = sign(
    claims({
      exp: NOW - 1,
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("token at exact expiry is rejected", async () => {
  const token = sign(
    claims({
      exp: NOW,
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("token lifetime over 90 seconds is rejected", async () => {
  const token = sign(
    claims({
      exp: NOW + 3600,
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("future issuance over allowed skew is rejected", async () => {
  const token = sign(
    claims({
      iat: NOW + 60,
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("future not-before over allowed skew is rejected", async () => {
  const token = sign(
    claims({
      nbf: NOW + 60,
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("invalid user ID is rejected", async () => {
  const token = sign(
    claims({
      sub: "attacker",
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("missing nonce is rejected", async () => {
  const token = sign(
    claims({
      jti: "",
    })
  );

  assert.equal(
    await accepted(token),
    null
  );
});

test("oversized token is rejected", async () => {
  const result = await accepted(
    "a".repeat(4097)
  );

  assert.equal(result, null);
});

test("malformed token is rejected", async () => {
  for (const token of [
    "",
    "abc",
    "a.b",
    "a.b.c.d",
    "!!!.!!!.!!!",
  ]) {
    assert.equal(
      await accepted(token),
      null
    );
  }
});

test("malformed signature is rejected", async () => {
  const token = sign(claims());

  const parts = token.split(".");
  parts[2] = "invalid-signature";

  assert.equal(
    await accepted(parts.join(".")),
    null
  );
});

/**
 * Important:
 * Replay protection is not tested here.
 *
 * The receiving HYPE DROP backend must
 * atomically consume jti in persistent
 * storage. Signature verification alone
 * cannot prevent token reuse.
 */

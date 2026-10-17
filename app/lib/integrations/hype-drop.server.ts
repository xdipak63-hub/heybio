
import { requireUser } from "../auth/require-user.server";
import { getVerifiedFeatureAccess } from "../creator/access.server";
import { getServerBindings } from "../supabase/admin.server";

const ISSUER = "heybio";
const AUDIENCE = "hype-drop";
const TOKEN_LIFETIME_SECONDS = 90;
const HEADER = { alg: "HS256", typ: "JWT" } as const;

export type HypeDropHandoffClaims = {
  iss: typeof ISSUER;
  aud: typeof AUDIENCE;
  sub: string;
  plan: "premium" | "pro_max";
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
};

function encode(value: unknown): string {
  const bytes = new TextEncoder().encode(
    JSON.stringify(value),
  );

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decode<T>(value: string): T {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid token encoding.");
  }

  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const binary = atob(
    base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    ),
  );

  const bytes = Uint8Array.from(
    binary,
    (char) => char.charCodeAt(0),
  );

  return JSON.parse(
    new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes),
  ) as T;
}

function signatureBytes(
  value: string,
): Uint8Array<ArrayBuffer> {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const binary = atob(
    base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    ),
  );

  return Uint8Array.from(
    binary,
    (char) => char.charCodeAt(0),
  );
}

async function keyFor(
  secret: string,
): Promise<CryptoKey> {
  if (
    new TextEncoder().encode(secret).length < 32
  ) {
    throw new Error(
      "HYPE DROP shared secret must contain at least 32 bytes.",
    );
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"],
  );
}

function encodeBytes(bytes: number[]): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * HEYBIO server-side only.
 *
 * Call from a protected route/action.
 * Never issue tokens from frontend state.
 *
 * HYPE DROP must verify:
 * - HMAC signature
 * - issuer and audience
 * - token timestamps
 * - nonce (jti)
 *
 * For one-time handoff, the receiving product
 * should atomically consume each jti.
 */
export async function createHypeDropHandoff(
  request: Request,
  context: unknown,
): Promise<{
  token: string;
  expiresAt: string;
}> {
  const { user, client } = await requireUser(
    request,
    context,
  );

  const access = await getVerifiedFeatureAccess(
    context,
    client.supabase,
    user.id,
    "hype_drop",
  );

  if (
    !access.allowed ||
    (access.billing.plan !== "premium" &&
      access.billing.plan !== "pro_max")
  ) {
    throw new Response(
      "HYPE DROP requires an active Premium or Pro Max plan.",
      {
        status: 403,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const env = getServerBindings(context);
  const secret = env.HYPE_DROP_SHARED_SECRET;

  if (!secret) {
    throw new Error(
      "HYPE DROP handoff is not configured.",
    );
  }

  const now = Math.floor(Date.now() / 1000);

  const periodEnd = Date.parse(
    access.billing.currentPeriodEnd ?? "",
  );

  const expiresAt = Math.min(
    now + TOKEN_LIFETIME_SECONDS,
    Math.floor(periodEnd / 1000),
  );

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <= now
  ) {
    throw new Response(
      "HYPE DROP entitlement has expired.",
      {
        status: 403,
      },
    );
  }

  const claims: HypeDropHandoffClaims = {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: user.id,
    plan: access.billing.plan,
    iat: now,
    nbf: now,
    exp: expiresAt,
    jti: crypto.randomUUID(),
  };

  const signingInput = [
    encode(HEADER),
    encode(claims),
  ].join(".");

  const signature = await crypto.subtle.sign(
    "HMAC",
    await keyFor(secret),
    new TextEncoder().encode(signingInput),
  );

  const signed = Array.from(
    new Uint8Array(signature),
  );

  return {
    token:
      `${signingInput}.${encodeBytes(signed)}`,
    expiresAt: new Date(
      expiresAt * 1000,
    ).toISOString(),
  };
}

/**
 * Server-side verification reference.
 *
 * HYPE DROP must use the same server-only
 * shared secret and verify the current
 * entitlement for ongoing access.
 *
 * A signed handoff token is NOT a permanent
 * HYPE DROP subscription or session.
 */
export async function verifyHypeDropHandoff(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): Promise<HypeDropHandoffClaims | null> {
  try {
    if (token.length > 4096) {
      return null;
    }

    const sections = token.split(".");

    if (sections.length !== 3) {
      return null;
    }

    const [head, body, signature] = sections;

    if (!head || !body || !signature) {
      return null;
    }

    const header = decode<{
      alg?: string;
      typ?: string;
    }>(head);

    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT"
    ) {
      return null;
    }

    const valid = await crypto.subtle.verify(
      "HMAC",
      await keyFor(secret),
      signatureBytes(signature),
      new TextEncoder().encode(
        `${head}.${body}`,
      ),
    );

    if (!valid) {
      return null;
    }

    const claims =
      decode<Partial<HypeDropHandoffClaims>>(
        body,
      );

    if (
      claims.iss !== ISSUER ||
      claims.aud !== AUDIENCE ||
      typeof claims.sub !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(claims.sub) ||
      (claims.plan !== "premium" &&
        claims.plan !== "pro_max") ||
      typeof claims.iat !== "number" ||
      !Number.isInteger(claims.iat) ||
      typeof claims.nbf !== "number" ||
      !Number.isInteger(claims.nbf) ||
      typeof claims.exp !== "number" ||
      !Number.isInteger(claims.exp) ||
      typeof claims.jti !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(claims.jti) ||
      claims.iat > now + 30 ||
      claims.nbf > now + 30 ||
      claims.exp <= now ||
      claims.exp >
        claims.iat + TOKEN_LIFETIME_SECONDS
    ) {
      return null;
    }

    return claims as HypeDropHandoffClaims;
  } catch {
    return null;
  }
}
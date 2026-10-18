
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

/**
 * HEYBIO — Phase 1W
 *
 * Revision-aware social links API.
 *
 * Requires migration 032:
 * save_my_social_links_versioned(jsonb, bigint)
 *
 * POST contract:
 * {
 *   expectedRevision: number,
 *   links: SocialInput[]
 * }
 *
 * Success:
 * { ok: true, revision: number }
 *
 * Stale save:
 * HTTP 409
 * { error: "SOCIAL_LINKS_CONFLICT" }
 */

const MAX_LINKS = 12;
const MAX_URL_LENGTH = 2048;
const MAX_BODY_BYTES = 16_384;

const PLATFORMS = new Set([
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "x",
  "linkedin",
  "github",
  "threads",
  "pinterest",
  "snapchat",
  "twitch",
  "website",
]);

type SocialInput = {
  platform: string;
  url: string;
  is_visible: boolean;
};

type SaveBody = {
  expectedRevision: number;
  links: SocialInput[];
};

function makeHeaders(
  source: Headers,
): Headers {
  const headers = new Headers(source);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0",
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow",
  );

  headers.set("Vary", "Cookie");

  return headers;
}

function errorResponse(
  message: string,
  status: number,
  headers: Headers,
): Response {
  return Response.json(
    { error: message },
    { status, headers },
  );
}

function normalizeUrl(
  value: string,
): string | null {
  const raw = value.trim();

  if (
    raw.length < 10 ||
    raw.length > MAX_URL_LENGTH ||
    /[\s\\\u0000-\u001f\u007f]/.test(raw)
  ) {
    return null;
  }

  try {
    const url = new URL(raw);

    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.href.length > MAX_URL_LENGTH
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function validateLinks(
  input: unknown,
): SocialInput[] | null {
  if (
    !Array.isArray(input) ||
    input.length > MAX_LINKS
  ) {
    return null;
  }

  const seen = new Set<string>();
  const links: SocialInput[] = [];

  for (const item of input) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return null;
    }

    const record = item as Record<
      string,
      unknown
    >;

    if (
      typeof record.platform !== "string" ||
      !PLATFORMS.has(record.platform) ||
      seen.has(record.platform) ||
      typeof record.url !== "string" ||
      typeof record.is_visible !== "boolean"
    ) {
      return null;
    }

    const url = normalizeUrl(
      record.url,
    );

    if (!url) return null;

    seen.add(record.platform);

    links.push({
      platform: record.platform,
      url,
      is_visible: record.is_visible,
    });
  }

  return links;
}

function validateBody(
  input: unknown,
): SaveBody | null {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return null;
  }

  const record = input as Record<
    string,
    unknown
  >;

  const expectedRevision =
    record.expectedRevision;

  if (
    typeof expectedRevision !== "number" ||
    !Number.isSafeInteger(
      expectedRevision,
    ) ||
    expectedRevision < 0
  ) {
    return null;
  }

  const links = validateLinks(
    record.links,
  );

  if (!links) return null;

  return {
    expectedRevision,
    links,
  };
}

async function readBody(
  request: Request,
): Promise<unknown> {
  const type = request.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (type !== "application/json") {
    throw new Error(
      "Unsupported content type",
    );
  }

  const declaredLength =
    request.headers.get(
      "content-length",
    );

  if (declaredLength !== null) {
    const length = Number(
      declaredLength,
    );

    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > MAX_BODY_BYTES
    ) {
      throw new Error(
        "Invalid request length",
      );
    }
  }

  if (!request.body) {
    throw new Error(
      "Missing request body",
    );
  }

  const reader =
    request.body.getReader();

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } =
        await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > MAX_BODY_BYTES) {
        await reader.cancel();

        throw new Error(
          "Request body too large",
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes =
    new Uint8Array(size);

  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder(
    "utf-8",
    { fatal: true },
  ).decode(bytes);

  return JSON.parse(text) as unknown;
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(
      request,
      context,
    );

  const headers = makeHeaders(
    client.headers,
  );

  const [linksResult, revisionResult] =
    await Promise.all([
      client.supabase
        .from("social_links")
        .select(
          "id,platform,url,position,is_visible",
        )
        .eq("user_id", user.id)
        .order("position", {
          ascending: true,
        }),

      client.supabase
        .from("social_links_revisions")
        .select("revision")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (
    linksResult.error ||
    revisionResult.error
  ) {
    console.error(
      "Social links GET failed",
      linksResult.error?.code,
      revisionResult.error?.code,
    );

    return errorResponse(
      "Unable to load social links.",
      503,
      headers,
    );
  }

  const revision =
    revisionResult.data?.revision ?? 0;

  if (
    typeof revision !== "number" ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  ) {
    return errorResponse(
      "Invalid social links revision.",
      503,
      headers,
    );
  }

  return Response.json(
    {
      links: linksResult.data ?? [],
      revision,
    },
    { headers },
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(
    request,
    ["POST"],
  );

  requireCsrfProtection(
    request,
  );

  const { client } =
    await requireUser(
      request,
      context,
    );

  const headers = makeHeaders(
    client.headers,
  );

  let body: unknown;

  try {
    body = await readBody(request);
  } catch {
    return errorResponse(
      "Invalid JSON request.",
      400,
      headers,
    );
  }

  const validated =
    validateBody(body);

  if (!validated) {
    return errorResponse(
      "Invalid social links or revision.",
      400,
      headers,
    );
  }

  const { data, error } =
    await client.supabase.rpc(
      "save_my_social_links_versioned",
      {
        p_links: validated.links,
        p_expected_revision:
          validated.expectedRevision,
      },
    );

  if (error) {
    if (
      error.code === "P0001" &&
      error.message.includes(
        "SOCIAL_LINKS_CONFLICT",
      )
    ) {
      return errorResponse(
        "SOCIAL_LINKS_CONFLICT",
        409,
        headers,
      );
    }

    console.error(
      "Versioned social save failed:",
      error.code,
    );

    if (
      error.code === "22023"
    ) {
      return errorResponse(
        "Invalid social links.",
        400,
        headers,
      );
    }

    if (
      error.code === "42501"
    ) {
      return errorResponse(
        "Access denied.",
        403,
        headers,
      );
    }

    return errorResponse(
      "Unable to save social links.",
      503,
      headers,
    );
  }

  const revision = Number(data);

  if (
    !Number.isSafeInteger(revision) ||
    revision < 1
  ) {
    return errorResponse(
      "Invalid save confirmation.",
      503,
      headers,
    );
  }

  return Response.json(
    {
      ok: true,
      revision,
    },
    { headers },
  );
}


import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "react-router";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod
} from "../../lib/security/csrf.server";

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
  "website"
]);

type SocialInput = {
  platform: string;
  url: string;
  is_visible: boolean;
};

function validate(
  input: unknown
): SocialInput[] | null {
  if (
    !Array.isArray(input) ||
    input.length > 12
  ) {
    return null;
  }

  const result: SocialInput[] = [];
  const seen = new Set<string>();

  for (const item of input) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return null;
    }

    const value = item as Record<string, unknown>;

    if (
      typeof value.platform !== "string" ||
      !PLATFORMS.has(value.platform) ||
      seen.has(value.platform) ||
      typeof value.url !== "string" ||
      typeof value.is_visible !== "boolean"
    ) {
      return null;
    }

    const raw = value.url.trim();

    if (
      raw.length < 10 ||
      raw.length > 2048 ||
      /[\s\\]/.test(raw)
    ) {
      return null;
    }

    let url: URL;

    try {
      url = new URL(raw);
    } catch {
      return null;
    }

    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.href.length > 2048
    ) {
      return null;
    }

    seen.add(value.platform);

    result.push({
      platform: value.platform,
      url: url.href,
      is_visible: value.is_visible
    });
  }

  return result;
}

const jsonHeaders = {
  "Cache-Control": "private, no-store",
  "Content-Type": "application/json"
};

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data, error } =
    await client.supabase
      .from("social_links")
      .select(
        "id, platform, url, position, is_visible"
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true });

  if (error) {
    return Response.json(
      { error: "Unable to load social links." },
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  return Response.json(
    { links: data ?? [] },
    {
      headers: new Headers([
        ...client.headers,
        ...Object.entries(jsonHeaders)
      ])
    }
  );
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const { client } =
    await requireUser(request, context);

  const length = Number(
    request.headers.get("content-length") ?? 0
  );

  if (
    length > 16384 ||
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return Response.json(
      { error: "Invalid request." },
      { status: 400, headers: client.headers }
    );
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 16384) {
      throw new Error("Payload too large");
    }

    body = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: "Invalid JSON payload." },
      { status: 400, headers: client.headers }
    );
  }

  const input =
    body &&
    typeof body === "object" &&
    "links" in body
      ? (body as { links: unknown }).links
      : null;

  const links = validate(input);

  if (!links) {
    return Response.json(
      { error: "Invalid social links." },
      { status: 400, headers: client.headers }
    );
  }

  const { error } = await client.supabase.rpc(
    "save_my_social_links",
    { p_links: links }
  );

  if (error) {
    console.error(
      "Social link save failed:",
      error.code
    );

    return Response.json(
      { error: "Unable to save social links." },
      { status: 503, headers: client.headers }
    );
  }

  return Response.json(
    { ok: true },
    { headers: client.headers }
  );
}

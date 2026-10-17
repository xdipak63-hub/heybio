
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

import {
  profileUpdateSchema,
} from "../../lib/validation/profile.schema";

const BASE = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  Vary: "Cookie",
};

function reply(
  body: unknown,
  status: number,
  session: Headers,
) {
  const headers = new Headers(session);

  for (const [key, value] of Object.entries(BASE)) {
    headers.set(key, value);
  }

  return Response.json(body, { status, headers });
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data, error } = await client.supabase
    .from("profiles")
    .select(
      "username,display_name,bio,avatar_path,account_status,updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return reply(
      { error: "Profile unavailable." },
      503,
      client.headers,
    );
  }

  if (!data) {
    return reply(
      { error: "Profile not found." },
      404,
      client.headers,
    );
  }

  return reply(
    { profile: data },
    200,
    client.headers,
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(request, [
    "POST",
    "PATCH",
  ]);

  requireCsrfProtection(request);

  const { user, client } =
    await requireUser(request, context);

  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return reply(
      { error: "JSON required." },
      415,
      client.headers,
    );
  }

  const declared = Number(
    request.headers.get("content-length") ?? "0",
  );

  if (
    !Number.isFinite(declared) ||
    declared > 4096
  ) {
    return reply(
      { error: "Request too large." },
      413,
      client.headers,
    );
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 4096) {
      return reply(
        { error: "Request too large." },
        413,
        client.headers,
      );
    }

    body = JSON.parse(raw) as unknown;
  } catch {
    return reply(
      { error: "Invalid JSON." },
      400,
      client.headers,
    );
  }

  const parsed =
    profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return reply(
      {
        error: "Invalid profile fields.",
        details:
          parsed.error.flatten().fieldErrors,
      },
      400,
      client.headers,
    );
  }

  const { data, error } = await client.supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .eq("account_status", "active")
    .select(
      "username,display_name,bio,avatar_path,updated_at",
    )
    .maybeSingle();

  if (error) {
    return reply(
      { error: "Profile could not be saved." },
      503,
      client.headers,
    );
  }

  if (!data) {
    return reply(
      { error: "Active profile required." },
      403,
      client.headers,
    );
  }

  return reply(
    {
      ok: true,
      profile: data,
    },
    200,
    client.headers,
  );
}

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
  validateLinkInput,
} from "../../lib/validation/links.schema";

const ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RESPONSE = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  Vary: "Cookie",
};

function reply(
  value: unknown,
  status: number,
  session: Headers,
) {
  const headers = new Headers(session);

  for (const [key, val] of Object.entries(RESPONSE)) {
    headers.set(key, val);
  }

  return Response.json(value, { status, headers });
}

function readLink(
  value: Record<string, unknown>,
) {
  if (
    typeof value.title !== "string" ||
    typeof value.url !== "string" ||
    (
      value.description !== undefined &&
      typeof value.description !== "string"
    )
  ) {
    return {
      success: false as const,
      error: "Invalid link fields.",
    };
  }

  const form = new FormData();

  form.set("title", value.title);
  form.set("url", value.url);

  form.set(
    "description",
    typeof value.description === "string"
      ? value.description
      : "",
  );

  return validateLinkInput(form);
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data, error } = await client.supabase
    .from("links")
    .select(
      "id,title,url,description,position,is_active",
    )
    .eq("profile_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return reply(
      { error: "Unable to load links." },
      503,
      client.headers,
    );
  }

  return reply(
    { links: data ?? [] },
    200,
    client.headers,
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
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

  const length = Number(
    request.headers.get("content-length") ?? "0",
  );

  if (
    !Number.isFinite(length) ||
    length > 16384
  ) {
    return reply(
      { error: "Request too large." },
      413,
      client.headers,
    );
  }

  let input: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (raw.length > 16384) {
      return reply(
        { error: "Request too large." },
        413,
        client.headers,
      );
    }

    const value: unknown =
      JSON.parse(raw);

    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new Error("Invalid JSON");
    }

    input = value as Record<string, unknown>;
  } catch {
    return reply(
      { error: "Invalid JSON." },
      400,
      client.headers,
    );
  }

  const intent = input.intent;
  const id = input.id;

  if (
    intent !== "create" &&
    intent !== "update" &&
    intent !== "toggle" &&
    intent !== "delete" &&
    intent !== "reorder"
  ) {
    return reply(
      { error: "Unknown action." },
      400,
      client.headers,
    );
  }

  if (
    intent !== "create" &&
    intent !== "reorder" &&
    (
      typeof id !== "string" ||
      !ID.test(id)
    )
  ) {
    return reply(
      { error: "Invalid link ID." },
      400,
      client.headers,
    );
  }

  // Atomic reorder using the existing
  // PostgreSQL function and authenticated RLS.
  if (intent === "reorder") {
    const ids = input.ids;

    if (
      !Array.isArray(ids) ||
      ids.length > 100 ||
      ids.some(
        (item) =>
          typeof item !== "string" ||
          !ID.test(item),
      ) ||
      new Set(ids).size !== ids.length
    ) {
      return reply(
        { error: "Invalid link order." },
        400,
        client.headers,
      );
    }

    const { error } = await client.supabase.rpc(
      "reorder_my_links",
      { p_ids: ids },
    );

    return error
      ? reply(
          { error: "Unable to save link order." },
          409,
          client.headers,
        )
      : reply(
          { ok: true },
          200,
          client.headers,
        );
  }

  // Delete only a link owned by this creator.
  if (intent === "delete") {
    const { data, error } = await client.supabase
      .from("links")
      .delete()
      .eq("profile_id", user.id)
      .eq("id", id as string)
      .select("id")
      .maybeSingle();

    if (error) {
      return reply(
        { error: "Unable to delete link." },
        503,
        client.headers,
      );
    }

    return data
      ? reply(
          { ok: true },
          200,
          client.headers,
        )
      : reply(
          { error: "Link not found." },
          404,
          client.headers,
        );
  }

  // Toggle public visibility.
  if (intent === "toggle") {
    if (typeof input.active !== "boolean") {
      return reply(
        { error: "Invalid visibility." },
        400,
        client.headers,
      );
    }

    const { data, error } = await client.supabase
      .from("links")
      .update({ is_active: input.active })
      .eq("profile_id", user.id)
      .eq("id", id as string)
      .select("id,is_active")
      .maybeSingle();

    if (error) {
      return reply(
        { error: "Unable to change visibility." },
        503,
        client.headers,
      );
    }

    return data
      ? reply(
          { ok: true, link: data },
          200,
          client.headers,
        )
      : reply(
          { error: "Link not found." },
          404,
          client.headers,
        );
  }

  const parsed = readLink(input);

  if (!parsed.success) {
    return reply(
      { error: parsed.error },
      400,
      client.headers,
    );
  }

  // Update an existing link.
  if (intent === "update") {
    const { data, error } = await client.supabase
      .from("links")
      .update(parsed.value)
      .eq("profile_id", user.id)
      .eq("id", id as string)
      .select(
        "id,title,url,description,position,is_active",
      )
      .maybeSingle();

    if (error) {
      return reply(
        { error: "Unable to update link." },
        503,
        client.headers,
      );
    }

    return data
      ? reply(
          { ok: true, link: data },
          200,
          client.headers,
        )
      : reply(
          { error: "Link not found." },
          404,
          client.headers,
        );
  }

  // Create a new link.
  const {
    count,
    error: countError,
  } = await client.supabase
    .from("links")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("profile_id", user.id);

  if (countError) {
    return reply(
      { error: "Unable to verify link limit." },
      503,
      client.headers,
    );
  }

  if ((count ?? 0) >= 100) {
    return reply(
      { error: "Maximum 100 links." },
      409,
      client.headers,
    );
  }

  const {
    data: last,
    error: orderError,
  } = await client.supabase
    .from("links")
    .select("position")
    .eq("profile_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    return reply(
      { error: "Unable to calculate link order." },
      503,
      client.headers,
    );
  }

  const { data, error } = await client.supabase
    .from("links")
    .insert({
      profile_id: user.id,
      ...parsed.value,
      position: (last?.position ?? -1) + 1,
    })
    .select(
      "id,title,url,description,position,is_active",
    )
    .single();

  if (error) {
    return reply(
      { error: "Unable to create link." },
      503,
      client.headers,
    );
  }

  return reply(
    {
      ok: true,
      link: data,
    },
    201,
    client.headers,
  );
}
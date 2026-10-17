
import type {
  LoaderFunctionArgs,
} from "react-router";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

const USERNAME_PATTERN =
  /^[a-z][a-z0-9_]{2,29}$/;

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const NOT_FOUND_HEADERS = {
  "Cache-Control": "public, max-age=30",
  "X-Content-Type-Options": "nosniff",
};

function notFound(): Response {
  return new Response(
    "Avatar not found.",
    {
      status: 404,
      headers: NOT_FOUND_HEADERS,
    },
  );
}

export async function loader({
  context,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const username = String(
    params.username ?? "",
  ).toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return notFound();
  }

  const admin = createSupabaseAdmin(
    getServerBindings(context),
  );

  const { data: profile, error } =
    await admin
      .from("profiles")
      .select(
        "id,avatar_path,account_status",
      )
      .eq("username", username)
      .eq("account_status", "active")
      .maybeSingle();

  if (error) {
    return new Response(
      "Image temporarily unavailable.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!profile?.avatar_path) {
    return notFound();
  }

  const path = profile.avatar_path;

  // The original upload API creates files
  // as:
  // userId/avatar-UUID.jpg|png|webp
  //
  // Never accept a caller-supplied storage path.

  const escapedId =
    profile.id.replaceAll("-", "\\-");

  const pathPattern = new RegExp(
    `^${escapedId}/avatar-` +
      `[0-9a-f]{8}-` +
      `[0-9a-f]{4}-` +
      `[0-9a-f]{4}-` +
      `[0-9a-f]{4}-` +
      `[0-9a-f]{12}\\.(jpg|png|webp)$`,
    "i",
  );

  const match = pathPattern.exec(path);

  if (!match) {
    return notFound();
  }

  const extension = match[1]?.toLowerCase();

  if (!extension || !MIME[extension]) {
    return notFound();
  }

  const { data: blob, error: storageError } =
    await admin.storage
      .from("heybio-media")
      .download(path);

  if (storageError || !blob) {
    return notFound();
  }

  if (
    blob.size === 0 ||
    blob.size > 2 * 1024 * 1024
  ) {
    return notFound();
  }

  return new Response(
    await blob.arrayBuffer(),
    {
      status: 200,
      headers: {
        "Content-Type": MIME[extension],
        "Content-Disposition": "inline",
        "Cache-Control":
          "public, max-age=60, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy":
          "same-origin",
      },
    },
  );
}
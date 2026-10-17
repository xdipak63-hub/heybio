
import type {
  ActionFunctionArgs
} from "react-router";

import { requireUser } from "../../lib/auth/require-user.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";

import {
  requireCsrfProtection,
  requireMutationMethod
} from "../../lib/security/csrf.server";

const BUCKET = "heybio-media";
const MAX_BYTES = 2 * 1024 * 1024;

type ImageType = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

function detectImage(
  bytes: Uint8Array
): ImageType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return {
      mime: "image/jpeg",
      extension: "jpg"
    };
  }

  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10]
      .every((value, index) => bytes[index] === value)
  ) {
    return {
      mime: "image/png",
      extension: "png"
    };
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return {
      mime: "image/webp",
      extension: "webp"
    };
  }

  return null;
}

function response(
  body: Record<string, unknown>,
  status: number,
  headers: Headers
) {
  const safeHeaders = new Headers(headers);

  safeHeaders.set(
    "Cache-Control",
    "private, no-store"
  );

  return Response.json(body, {
    status,
    headers: safeHeaders
  });
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const { user, client } =
    await requireUser(request, context);
  await requireRateLimit((context as { cloudflare?: { env?: unknown } }).cloudflare?.env,
    { namespace: "avatar-upload", key: user.id });

  const contentType =
    request.headers.get("content-type") ?? "";

  if (!contentType.startsWith("multipart/form-data")) {
    return response(
      { error: "Expected multipart image upload." },
      415,
      client.headers
    );
  }

  const declaredLength = Number(
    request.headers.get("content-length") ?? 0
  );

  if (
    !Number.isFinite(declaredLength) ||
    declaredLength > MAX_BYTES + 65536
  ) {
    return response(
      { error: "Upload is too large." },
      413,
      client.headers
    );
  }

  let form: FormData;

  try {
    // Do not let chunked requests bypass the Content-Length check.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing upload body");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES + 65536) {
        await reader.cancel().catch(() => {});
        return response({ error: "Upload is too large." }, 413, client.headers);
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    const safeRequest = new Request(request.url, {
      method: "POST", headers: { "Content-Type": contentType }, body: buffer
    });
    form = await safeRequest.formData();
  } catch {
    return response(
      { error: "Invalid upload request." },
      400,
      client.headers
    );
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return response(
      { error: "Image file is required." },
      400,
      client.headers
    );
  }

  if (
    file.size === 0 ||
    file.size > MAX_BYTES
  ) {
    return response(
      { error: "Image must be under 2 MB." },
      413,
      client.headers
    );
  }

  const bytes = new Uint8Array(
    await file.arrayBuffer()
  );

  const detected = detectImage(bytes);

  if (
    !detected ||
    file.type !== detected.mime
  ) {
    return response(
      { error: "Unsupported image format." },
      415,
      client.headers
    );
  }

  const { data: profile, error: profileError } =
    await client.supabase
      .from("profiles")
      .select("id, account_status, avatar_path")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    profile.account_status !== "active"
  ) {
    return response(
      { error: "Active creator profile required." },
      403,
      client.headers
    );
  }

  const path =
    `${user.id}/avatar-${crypto.randomUUID()}` +
    `.${detected.extension}`;

  const { error: uploadError } =
    await client.supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: detected.mime,
        cacheControl: "3600",
        upsert: false
      });

  if (uploadError) {
    console.error(
      "Avatar upload failed:",
      uploadError.message
    );

    return response(
      { error: "Unable to upload image." },
      503,
      client.headers
    );
  }

  let mutation = client.supabase.from("profiles")
    .update({ avatar_path: path }).eq("id", user.id)
    .eq("account_status", "active");
  mutation = profile.avatar_path === null
    ? mutation.is("avatar_path", null)
    : mutation.eq("avatar_path", profile.avatar_path);
  const { data: updated, error: updateError } =
    await mutation.select("avatar_path").maybeSingle();

  if (
    updateError ||
    updated?.avatar_path !== path
  ) {
    // Clean up the new object if the profile
    // database update could not be completed.
    await client.supabase.storage
      .from(BUCKET)
      .remove([path]);

    return response(
      { error: "Unable to save profile image." },
      503,
      client.headers
    );
  }

  // Remove the previous avatar only after the new DB pointer is committed.
  if (profile.avatar_path && profile.avatar_path !== path &&
      profile.avatar_path.startsWith(`${user.id}/`)) {
    const { error: cleanupError } = await client.supabase.storage
      .from(BUCKET).remove([profile.avatar_path]);
    if (cleanupError) console.warn("Prior avatar cleanup requires retry");
  }

  const { data: signed, error: signError } =
    await client.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

  if (signError || !signed?.signedUrl) {
    return response(
      {
        ok: true,
        path,
        previewUrl: null,
        warning: "Uploaded, but preview is temporarily unavailable."
      },
      200,
      client.headers
    );
  }

  return response(
    {
      ok: true,
      path,
      previewUrl: signed.signedUrl,
      expiresIn: 3600
    },
    200,
    client.headers
  );
}

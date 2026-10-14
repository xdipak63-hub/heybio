
import type {
  ActionFunctionArgs
} from "react-router";

import {
  requireAdmin
} from "../../lib/auth/require-admin.server";

import {
  requireCsrfProtection,
  requireMutationMethod
} from "../../lib/security/csrf.server";

import {
  moderateUser,
  moderationActionSchema,
  ModerationError
} from "../../lib/admin/moderation.server";

const MAX_BODY_BYTES = 4096;

function errorResponse(
  message: string,
  status: number
): Response {
  return Response.json(
    {
      ok: false,
      error: message
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    }
  );
}

async function readJsonSafely(
  request: Request
): Promise<unknown> {
  const contentLength =
    request.headers.get("content-length");

  if (
    contentLength !== null &&
    Number(contentLength) > MAX_BODY_BYTES
  ) {
    throw new ModerationError(
      "INVALID_INPUT",
      "Request body is too large.",
      413
    );
  }

  const reader = request.body?.getReader();

  if (!reader) {
    throw new ModerationError(
      "INVALID_INPUT",
      "Request body is required.",
      400
    );
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      total += value.byteLength;

      if (total > MAX_BODY_BYTES) {
        await reader.cancel();

        throw new ModerationError(
          "INVALID_INPUT",
          "Request body is too large.",
          413
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(
      new TextDecoder("utf-8", {
        fatal: true
      }).decode(buffer)
    ) as unknown;
  } catch {
    throw new ModerationError(
      "INVALID_INPUT",
      "Invalid JSON body.",
      400
    );
  }
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  // POST only.
  requireMutationMethod(request, ["POST"]);

  // Same-origin browser request required.
  requireCsrfProtection(request);

  // Every request must pass full admin
  // identity, MFA, role and permission checks.
  const admin = await requireAdmin(
    request,
    context,
    "users.moderate"
  );

  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return errorResponse(
      "Content type must be application/json.",
      415
    );
  }

  try {
    const body = await readJsonSafely(request);

    const parsed =
      moderationActionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Invalid moderation request.",
        400
      );
    }

    const result = await moderateUser(
      context,
      admin,
      parsed.data
    );

    return Response.json(
      {
        ok: true,
        result
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff"
        }
      }
    );
  } catch (error) {
    if (error instanceof ModerationError) {
      return errorResponse(
        error.message,
        error.status
      );
    }

    console.error(
      "[HEYBIO_ADMIN_API]",
      "Unexpected moderation failure"
    );

    return errorResponse(
      "Request could not be completed.",
      500
    );
  }
}

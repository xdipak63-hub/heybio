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
  createSupabaseAdmin,
  getServerBindings
} from "../../lib/supabase/admin.server";

import {
  z
} from "zod";

const moderationSchema = z.object({
  action: z.enum([
    "suspend",
    "restore"
  ]),
  userId: z.string().uuid(),
  reason: z.string()
    .trim()
    .min(5)
    .max(2000)
});

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);

  const admin = await requireAdmin(
    request,
    context,
    "users.moderate"
  );

  const rawBody: unknown =
    await request.json().catch(() => null);

  const parsed =
    moderationSchema.safeParse(rawBody);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid moderation request" },
      { status: 400 }
    );
  }

  const {
    action,
    userId,
    reason
  } = parsed.data;

  if (userId === admin.user.id) {
    return Response.json(
      {
        error:
          "You cannot moderate your own account."
      },
      { status: 403 }
    );
  }

  const db = createSupabaseAdmin(
    getServerBindings(context)
  );

  // One database transaction performs:
  // identity check, profile status update,
  // moderation history and audit record.
  const { data, error } = await db.rpc(
    "admin_moderate_user",
    {
      p_actor_id: admin.user.id,
      p_target_id: userId,
      p_action: action,
      p_reason: reason
    }
  );

  if (error) {
    console.error(
      "Admin moderation failed:",
      error.code
    );

    return Response.json(
      {
        error:
          "Moderation action could not be completed."
      },
      { status: 503 }
    );
  }

  return Response.json(
    {
      ok: true,
      result: data
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
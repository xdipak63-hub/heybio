import type {
  SupabaseClient
} from "@supabase/supabase-js";

export type AdminAuditAction =
  | "user.suspend"
  | "user.restore"
  | "user.delete_request"
  | "subscription.inspect"
  | "payment.refund_request"
  | "hype_access.inspect"
  | "settings.update";

export type AdminAuditTarget =
  | "user"
  | "subscription"
  | "payment"
  | "settings";

export interface AdminAuditInput {
  actorUserId: string;
  action: AdminAuditAction;
  targetType: AdminAuditTarget;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  const blockedKeys = new Set([
    "password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "secret",
    "api_key",
    "card_number",
    "cvv"
  ]);

  const result: Record<string, unknown> = {};

  for (const [key, value] of
    Object.entries(metadata)) {
    if (
      blockedKeys.has(key.toLowerCase())
    ) {
      continue;
    }

    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }

  return result;
}

export async function writeAdminAuditLog(
  db: SupabaseClient,
  input: AdminAuditInput
): Promise<string> {
  if (!input.actorUserId) {
    throw new Error(
      "Audit actor is required."
    );
  }

  const { data, error } = await db
    .from("admin_audit_logs")
    .insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      target_type: input.targetType,
      target_id:
        input.targetId ?? null,
      metadata: sanitizeMetadata(
        input.metadata ?? {}
      )
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      "Admin audit log could not be persisted."
    );
  }

  return data.id as string;
}
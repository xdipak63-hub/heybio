
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  createSupabaseAdmin,
  getServerBindings
} from "../supabase/admin.server";

import type {
  VerifiedAdmin
} from "../auth/require-admin.server";

/**
 * HEYBIO — Admin Moderation Service
 * By DIPO LABS
 *
 * SECURITY:
 * - Never import this module into client components.
 * - Call only after requireAdmin("users.moderate").
 * - Never accept actorUserId from the browser.
 * - Never expose Supabase service credentials.
 * - The database RPC performs the mutation,
 *   moderation history and audit logging.
 */

export const moderationActionSchema = z
  .object({
    action: z.enum(["suspend", "restore"]),
    userId: z.string().uuid(),
    reason: z.string().trim().min(5).max(2000)
  })
  .strict();

export type ModerationAction = z.infer<
  typeof moderationActionSchema
>["action"];

export type ModerationInput = z.infer<
  typeof moderationActionSchema
>;

export type ModerationStatus =
  | "active"
  | "suspended";

export interface ModerationResult {
  success: true;
  userId: string;
  status: ModerationStatus;
}

export type ModerationErrorCode =
  | "INVALID_INPUT"
  | "SELF_MODERATION"
  | "DATABASE_UNAVAILABLE"
  | "INVALID_DATABASE_RESPONSE";

export class ModerationError extends Error {
  readonly code: ModerationErrorCode;
  readonly status: number;

  constructor(
    code: ModerationErrorCode,
    message: string,
    status: number
  ) {
    super(message);
    this.name = "ModerationError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isModerationStatus(
  value: unknown
): value is ModerationStatus {
  return value === "active" ||
    value === "suspended";
}

function validateRpcResult(
  value: unknown,
  expectedUserId: string,
  expectedStatus: ModerationStatus
): ModerationResult {
  if (
    !isRecord(value) ||
    value.success !== true ||
    value.user_id !== expectedUserId ||
    !isModerationStatus(value.status) ||
    value.status !== expectedStatus
  ) {
    throw new ModerationError(
      "INVALID_DATABASE_RESPONSE",
      "Moderation result could not be verified.",
      503
    );
  }

  return {
    success: true,
    userId: expectedUserId,
    status: value.status
  };
}

/**
 * Execute a moderation operation.
 *
 * Preconditions:
 * - Caller already passed requireAdmin.
 * - Actor is an approved verified super admin.
 * - MFA assurance level is AAL2.
 * - Caller has users.moderate permission.
 *
 * The existing database function independently
 * checks actor identity, role and target rules.
 */
export async function moderateUser(
  context: unknown,
  admin: VerifiedAdmin,
  input: ModerationInput
): Promise<ModerationResult> {
  const parsed =
    moderationActionSchema.safeParse(input);

  if (!parsed.success) {
    throw new ModerationError(
      "INVALID_INPUT",
      "Invalid moderation request.",
      400
    );
  }

  const { action, userId, reason } = parsed.data;

  if (userId === admin.user.id) {
    throw new ModerationError(
      "SELF_MODERATION",
      "You cannot moderate your own account.",
      403
    );
  }

  const expectedStatus: ModerationStatus =
    action === "suspend"
      ? "suspended"
      : "active";

  const db: SupabaseClient =
    createSupabaseAdmin(
      getServerBindings(context)
    );

  let rpcData: unknown;

  try {
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
      // Do not log reasons, tokens,
      // emails or full database errors.
      console.error(
        "[HEYBIO_ADMIN_MODERATION]",
        { code: error.code }
      );

      throw new ModerationError(
        "DATABASE_UNAVAILABLE",
        "Moderation could not be completed.",
        503
      );
    }

    rpcData = data;
  } catch (error) {
    if (error instanceof ModerationError) {
      throw error;
    }

    console.error(
      "[HEYBIO_ADMIN_MODERATION]",
      "RPC transport failure"
    );

    throw new ModerationError(
      "DATABASE_UNAVAILABLE",
      "Moderation service is unavailable.",
      503
    );
  }

  return validateRpcResult(
    rpcData,
    userId,
    expectedStatus
  );
}

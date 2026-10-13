import { z } from "zod";

export const providerSubscriptionSchema = z.object({
  id: z.string().regex(/^sub_[A-Za-z0-9]+$/),
  entity: z.literal("subscription"),
  plan_id: z.string().regex(/^plan_[A-Za-z0-9]+$/),
  status: z.enum([
    "created",
    "authenticated",
    "active",
    "pending",
    "halted",
    "cancelled",
    "completed",
    "expired"
  ]),
  current_start: z.number().int().nonnegative()
    .nullable().optional(),
  current_end: z.number().int().nonnegative()
    .nullable().optional()
}).passthrough();

export type ProviderSubscription =
  z.infer<typeof providerSubscriptionSchema>;

export function parseProviderSubscription(
  value: unknown
): ProviderSubscription {
  return providerSubscriptionSchema.parse(value);
}

export function unixSecondsToIso(
  value: number | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 253402300799
  ) {
    throw new Error("Invalid provider timestamp");
  }

  const date = new Date(value * 1000);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid provider timestamp");
  }

  return date.toISOString();
}

export function extractSubscriptionId(
  payload: unknown
): string | null {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const envelope = root.payload;

  if (
    typeof envelope !== "object" ||
    envelope === null
  ) {
    return null;
  }

  const entities = envelope as Record<string, unknown>;

  for (const key of ["subscription", "payment"]) {
    const wrapper = entities[key];

    if (
      typeof wrapper !== "object" ||
      wrapper === null
    ) {
      continue;
    }

    const entity = (
      wrapper as Record<string, unknown>
    ).entity;

    if (
      typeof entity !== "object" ||
      entity === null
    ) {
      continue;
    }

    const record = entity as Record<string, unknown>;

    const id = key === "subscription"
      ? record.id
      : record.subscription_id;

    if (
      typeof id === "string" &&
      /^sub_[A-Za-z0-9]+$/.test(id)
    ) {
      return id;
    }
  }

  return null;
}
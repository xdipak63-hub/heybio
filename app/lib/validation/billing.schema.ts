import { z } from "zod";

export const paidPlanSchema = z.enum([
  "pro",
  "premium",
  "pro_max"
]);

export const checkoutRequestSchema =
  z.object({
    planId: paidPlanSchema
  }).strict();

export const cancellationRequestSchema =
  z.object({
    cancelAtCycleEnd: z.boolean()
      .optional()
  }).strict();

export const razorpaySubscriptionIdSchema =
  z.string()
    .regex(
      /^sub_[A-Za-z0-9]+$/,
      "Invalid Razorpay subscription ID."
    );

export const razorpayPaymentIdSchema =
  z.string()
    .regex(
      /^pay_[A-Za-z0-9]+$/,
      "Invalid Razorpay payment ID."
    );

export const razorpayPlanIdSchema =
  z.string()
    .regex(
      /^plan_[A-Za-z0-9]+$/,
      "Invalid Razorpay plan ID."
    );

export const razorpayWebhookEventIdSchema =
  z.string()
    .trim()
    .min(1)
    .max(200);

export const paymentAmountSchema =
  z.number()
    .int()
    .safe()
    .nonnegative();

export const adminRefundRequestSchema =
  z.object({
    paymentId: razorpayPaymentIdSchema,
    amountPaise: paymentAmountSchema,
    reason: z.string()
      .trim()
      .min(10)
      .max(500)
  }).strict();

export type CheckoutRequest =
  z.infer<typeof checkoutRequestSchema>;

export type CancellationRequest =
  z.infer<
    typeof cancellationRequestSchema
  >;

export type AdminRefundRequest =
  z.infer<
    typeof adminRefundRequestSchema
  >;

export function parseCheckoutRequest(
  input: unknown
): CheckoutRequest {
  return checkoutRequestSchema.parse(input);
}

export function parseCancellationRequest(
  input: unknown
): CancellationRequest {
  return cancellationRequestSchema.parse(input);
}

export function parseAdminRefundRequest(
  input: unknown
): AdminRefundRequest {
  return adminRefundRequestSchema.parse(input);
}
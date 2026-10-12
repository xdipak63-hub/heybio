import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128, "Password is too long.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required.")
  .max(80, "Maximum 80 characters.");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9_]{2,24}$/,
    "Use 3–25 characters. Start with a letter."
  );

export const signupSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptedTerms: z.literal(true, {
    error: "You must accept the terms."
  })
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.")
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const usernameClaimSchema = z.object({
  username: usernameSchema
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UsernameClaimInput =
  z.infer<typeof usernameClaimSchema>;

export function validateSignup(input: unknown) {
  return signupSchema.safeParse(input);
}

export function validateLogin(input: unknown) {
  return loginSchema.safeParse(input);
}

export function validateUsername(input: unknown) {
  return usernameClaimSchema.safeParse(input);
}
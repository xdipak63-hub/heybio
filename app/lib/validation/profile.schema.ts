import { z } from "zod";

export const RESERVED_USERNAMES =
  new Set([
    "admin",
    "administrator",
    "api",
    "auth",
    "billing",
    "dashboard",
    "dipolabs",
    "heybio",
    "help",
    "hypedrop",
    "login",
    "logout",
    "me",
    "pricing",
    "privacy",
    "root",
    "settings",
    "signup",
    "support",
    "system",
    "www"
  ]);

export const usernameSchema =
  z.string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z][a-z0-9_]{2,29}$/,
      "Username must be 3–30 characters, start with a letter and contain only lowercase letters, numbers or underscores."
    )
    .refine(
      (username) =>
        !RESERVED_USERNAMES.has(username),
      "This username is reserved."
    );

export const displayNameSchema =
  z.string()
    .trim()
    .max(80);

export const bioSchema =
  z.string()
    .trim()
    .max(500);

export const profileUpdateSchema =
  z.object({
    display_name:
      displayNameSchema.optional(),

    bio: bioSchema.optional()
  }).strict().refine(
    (value) =>
      Object.keys(value).length > 0,
    "At least one profile field is required."
  );

export const usernameUpdateSchema =
  z.object({
    username: usernameSchema
  }).strict();

export type ProfileUpdateInput =
  z.infer<typeof profileUpdateSchema>;

export type UsernameUpdateInput =
  z.infer<typeof usernameUpdateSchema>;

export function parseProfileUpdate(
  input: unknown
): ProfileUpdateInput {
  return profileUpdateSchema.parse(input);
}

export function parseUsernameUpdate(
  input: unknown
): UsernameUpdateInput {
  return usernameUpdateSchema.parse(input);
}
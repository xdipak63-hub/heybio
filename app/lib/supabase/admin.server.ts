
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export interface AdminBindings {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface ServerBindings
  extends Record<string, string> {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
}

function requireNonEmpty(
  value: unknown,
  name: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `Missing or invalid server binding: ${name}`,
    );
  }

  return value;
}

export function getServerBindings(
  context: unknown,
): ServerBindings {
  if (
    !context ||
    typeof context !== "object" ||
    !("cloudflare" in context)
  ) {
    throw new Error(
      "Cloudflare context is unavailable.",
    );
  }

  const cloudflare = (
    context as {
      cloudflare?: {
        env?: unknown;
      };
    }
  ).cloudflare;

  const rawEnv = cloudflare?.env;

  if (
    !rawEnv ||
    typeof rawEnv !== "object" ||
    Array.isArray(rawEnv)
  ) {
    throw new Error(
      "Cloudflare environment bindings are unavailable.",
    );
  }

  const env = rawEnv as Record<
    string,
    unknown
  >;

  const bindings: Record<
    string,
    string
  > = {};

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      bindings[key] = value;
    }
  }

  bindings.SUPABASE_URL =
    requireNonEmpty(
      env.SUPABASE_URL,
      "SUPABASE_URL",
    );

  bindings.SUPABASE_SERVICE_ROLE_KEY =
    requireNonEmpty(
      env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  return bindings as ServerBindings;
}

export function createSupabaseAdmin(
  env: AdminBindings,
): SupabaseClient {
  const url = requireNonEmpty(
    env.SUPABASE_URL,
    "SUPABASE_URL",
  );

  const serviceKey = requireNonEmpty(
    env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      "Supabase URL must use HTTPS.",
    );
  }

  return createClient(
    parsedUrl.toString(),
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "X-Client-Info":
            "heybio-worker",
        },
      },
    },
  );
}

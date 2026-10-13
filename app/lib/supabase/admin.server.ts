import {
  createClient,
  type SupabaseClient
} from "@supabase/supabase-js";

export interface AdminBindings {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function requireNonEmpty(
  value: string | undefined,
  name: string
): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing server environment binding: ${name}`
    );
  }

  return value;
}

export function createSupabaseAdmin(
  env: AdminBindings
): SupabaseClient {
  const url = requireNonEmpty(
    env.SUPABASE_URL,
    "SUPABASE_URL"
  );

  const serviceKey = requireNonEmpty(
    env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          "X-Client-Info": "heybio-worker"
        }
      }
    }
  );
}

export function getServerBindings(
  context: unknown
): Record<string, string> {
  if (
    !context ||
    typeof context !== "object" ||
    !("cloudflare" in context)
  ) {
    throw new Error(
      "Cloudflare context is unavailable."
    );
  }

  const cloudflare = (
    context as {
      cloudflare?: {
        env?: Record<string, string>;
      };
    }
  ).cloudflare;

  if (!cloudflare?.env) {
    throw new Error(
      "Cloudflare environment bindings are unavailable."
    );
  }

  return cloudflare.env;
}
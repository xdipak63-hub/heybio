import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader
} from "@supabase/ssr";

type SupabaseBindings = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
};

type WorkerRouteContext = {
  cloudflare: {
    env: SupabaseBindings;
  };
};

export function createSupabaseServer(
  request: Request,
  context: unknown
) {
  const worker = context as WorkerRouteContext;
  const env = worker.cloudflare.env;

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error(
      "Supabase environment bindings are missing."
    );
  }

  const headers = new Headers();

  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");

  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(
            request.headers.get("Cookie") ?? ""
          );
        },

        setAll(cookiesToSet, cacheHeaders) {
          for (const cookie of cookiesToSet) {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(
                cookie.name,
                cookie.value,
                cookie.options
              )
            );
          }

          for (const [key, value] of Object.entries(
            cacheHeaders ?? {}
          )) {
            headers.set(key, value);
          }

          headers.set(
            "Cache-Control",
            "private, no-store"
          );
          headers.set("Vary", "Cookie");
        }
      }
    }
  );

  return {
    supabase,
    headers
  };
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  const expected = new URL(request.url).origin;

  if (origin !== expected) {
    throw new Response(
      "Invalid request origin.",
      { status: 403 }
    );
  }
}
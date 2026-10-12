import {
  createClient,
  type SupabaseClient
} from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getPublicConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing public Supabase environment variables."
    );
  }

  const parsed = new URL(url);

  if (parsed.protocol !== "https:") {
    throw new Error("Supabase URL must use HTTPS.");
  }

  return { url, key };
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "Browser Supabase client cannot run on the server."
    );
  }

  if (!client) {
    const { url, key } = getPublicConfig();

    client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce"
      },
      global: {
        headers: {
          "X-Client-Info": "heybio-web"
        }
      }
    });
  }

  return client;
}

export async function getBrowserAccessToken():
  Promise<string | null> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) return null;

  return data.session?.access_token ?? null;
}

export async function signOutBrowser(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { createSupabaseAdmin, getServerBindings } from "../../lib/supabase/admin.server";
import { requireRateLimit, type RateLimitBindings } from "../../lib/security/rate-limit.server";

const PATTERN = /^[a-z][a-z0-9_]{2,29}$/;
const BLOCKED = new Set([
  "admin", "administrator", "api", "app", "auth", "billing", "callback", "contact", "dashboard",
  "dipolabs", "dipo_labs", "explore", "features", "forgot-password", "heybio", "help",
  "hypedrop", "login", "logout", "me", "news", "onboarding", "official", "pricing", "privacy",
  "register", "reset-password", "root", "security", "settings", "signup", "staff", "support",
  "system", "templates", "terms", "verify-email", "www", "our-story", "about-heybio", "about-dipolabs",
  "whats-new", "report-problem", "getting-started", "faqs", "cookie-policy", "refund-policy",
]);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const name = (new URL(request.url).searchParams.get("username") ?? "").trim().toLowerCase();
  const headers = new Headers({ "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" });
  const respond = (available: boolean, message: string, status = 200) =>
    data({ available, message }, { status, headers });

  if (!PATTERN.test(name) || BLOCKED.has(name)) return respond(false, "This username cannot be used.", 400);

  // Reuse the Cloudflare rate-limiter binding when configured; local environments
  // without the binding still allow onboarding. Configure RATE_LIMITER before launch.
  const rateBindings = (context as { cloudflare?: { env?: RateLimitBindings } }).cloudflare?.env ?? {};
  try {
    await requireRateLimit(rateBindings, {
      namespace: "username-check",
      key: request.headers.get("CF-Connecting-IP") ?? "unknown",
      failClosed: false,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    return respond(false, "Availability is temporarily unavailable.", 503);
  }

  // This API runs only on the server. User-session queries cannot see other creators'
  // profiles due to RLS, so a server-only service client is required here.
  try {
    const env = getServerBindings(context);
    const admin = createSupabaseAdmin({
      SUPABASE_URL: env.SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    });
    const [profile, reserved] = await Promise.all([
      admin.from("profiles").select("id").eq("username", name).limit(1).maybeSingle(),
      admin.from("reserved_usernames").select("username").eq("username", name).limit(1).maybeSingle(),
    ]);
    if (profile.error || reserved.error) return respond(false, "Availability is temporarily unavailable.", 503);
    if (profile.data || reserved.data) return respond(false, "That username is already taken or reserved.");
    return respond(true, "It's available! Continue to create your page.");
  } catch {
    return respond(false, "Availability is temporarily unavailable.", 503);
  }
}

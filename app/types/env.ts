
export interface PublicEnvironment {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
}

export interface PrivateEnvironment
  extends PublicEnvironment {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
}

export interface CloudflareAppContext {
  cloudflare: {
    env: PrivateEnvironment;
  };
}

export function getServerEnvironment(
  context: unknown,
): PrivateEnvironment {
  if (
    typeof context !== "object" ||
    context === null ||
    !("cloudflare" in context)
  ) {
    throw new Error(
      "Cloudflare context unavailable.",
    );
  }

  const cloudflare = (
    context as CloudflareAppContext
  ).cloudflare;

  if (
    !cloudflare?.env?.SUPABASE_URL ||
    !cloudflare.env.SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error(
      "Required Supabase bindings missing.",
    );
  }

  return cloudflare.env;
}
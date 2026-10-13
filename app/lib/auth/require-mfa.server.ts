import type {
  SupabaseClient
} from "@supabase/supabase-js";

export type MfaVerificationResult = {
  currentLevel: "aal1" | "aal2";
  nextLevel: "aal1" | "aal2";
  verified: true;
};

export async function requireMfa(
  supabase: SupabaseClient
): Promise<MfaVerificationResult> {
  const { data, error } =
    await supabase.auth.mfa
      .getAuthenticatorAssuranceLevel();

  if (error || !data) {
    throw new Response(
      "Unable to verify MFA status.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  if (data.currentLevel !== "aal2") {
    throw new Response(
      "Multi-factor authentication is required.",
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return {
    currentLevel: "aal2",
    nextLevel: data.nextLevel,
    verified: true
  };
}
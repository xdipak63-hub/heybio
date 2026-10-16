
/**
 * HEYBIO — Cloudflare Turnstile server verification
 *
 * Server-only module.
 * Never expose TURNSTILE_SECRET_KEY to the browser.
 */

type TurnstileEnv = {
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type RuntimeContext = {
  cloudflare?: {
    env?: TurnstileEnv;
  };
  env?: TurnstileEnv;
};

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

export type TurnstileVerdict =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: 400 | 503;
      message: string;
    };

function getEnvironment(context: unknown): TurnstileEnv {
  if (!context || typeof context !== "object") {
    return {};
  }

  const runtime = context as RuntimeContext;

  return runtime.cloudflare?.env ?? runtime.env ?? {};
}

export function getTurnstileSiteKey(
  context: unknown,
): string {
  const env = getEnvironment(context);

  return env.TURNSTILE_SITE_KEY?.trim() ?? "";
}

export async function verifyTurnstile(
  _request: Request,
  context: unknown,
  token: string,
): Promise<TurnstileVerdict> {
  const env = getEnvironment(context);

  const secret = env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    return {
      ok: false,
      status: 503,
      message:
        "Security verification is temporarily unavailable. Please try again later.",
    };
  }

  const responseToken = token.trim();

  if (!responseToken || responseToken.length > 2048) {
    return {
      ok: false,
      status: 400,
      message:
        "Please complete the security verification.",
    };
  }

  const body = new URLSearchParams();

  body.set("secret", secret);
  body.set("response", responseToken);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        status: 503,
        message:
          "Security service is temporarily unavailable. Please retry.",
      };
    }

    const result =
      (await response.json()) as SiteverifyResponse;

    if (result.success !== true) {
      return {
        ok: false,
        status: 400,
        message:
          "Security check expired or failed. Please retry verification.",
      };
    }

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message:
        "Unable to verify your connection. Please try again.",
    };
  }
}

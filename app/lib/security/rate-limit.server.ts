export interface CloudflareRateLimiter {
  limit(options: {
    key: string;
  }): Promise<{
    success: boolean;
  }>;
}

export interface RateLimitBindings {
  RATE_LIMITER?: CloudflareRateLimiter;
}

export interface RateLimitOptions {
  namespace: string;
  key: string;
  failClosed?: boolean;
}

function normalizeRateLimitKey(
  namespace: string,
  key: string
): string {
  if (
    !/^[a-z0-9_-]{2,48}$/i.test(namespace)
  ) {
    throw new Error(
      "Invalid rate limit namespace."
    );
  }

  if (!key || key.length > 256) {
    throw new Error(
      "Invalid rate limit key."
    );
  }

  return `${namespace}:${key}`;
}

export async function requireRateLimit(
  env: unknown,
  options: RateLimitOptions
): Promise<void> {
  const limiter = env && typeof env === "object" && "RATE_LIMITER" in env
    ? (env as RateLimitBindings).RATE_LIMITER : undefined;

  if (!limiter) {
    if (options.failClosed !== false) {
      throw new Response(
        "Rate limiting unavailable.",
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "60"
          }
        }
      );
    }

    return;
  }

  let allowed = false;

  try {
    const result = await limiter.limit({
      key: normalizeRateLimitKey(
        options.namespace,
        options.key
      )
    });

    allowed = result.success;
  } catch {
    if (options.failClosed !== false) {
      throw new Response(
        "Rate limiting temporarily unavailable.",
        {
          status: 503,
          headers: {
            "Retry-After": "60",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    return;
  }

  if (!allowed) {
    throw new Response(
      "Too many requests. Try again later.",
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
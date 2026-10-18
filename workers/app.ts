
import {
  createRequestHandler,
  type AppLoadContext,
} from "react-router";

import {
  runBillingJobs,
  type BillingJobBindings,
} from "../app/lib/payments/billing-jobs.server";

export interface HeybioBindings
  extends BillingJobBindings {
  SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface HeybioContext
  extends AppLoadContext {
  cloudflare: {
    env: HeybioBindings;
    ctx: ExecutionContext;
  };
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

function applySecurityHeaders(
  request: Request,
  response: Response,
): Response {
  const headers = new Headers(response.headers);

  headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  headers.set(
    "X-Frame-Options",
    "DENY",
  );

  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  headers.set(
    "Cross-Origin-Resource-Policy",
    "same-origin",
  );

  const url = new URL(request.url);

  if (url.protocol === "https:") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000",
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(
    request: Request,
    env: HeybioBindings,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const context: HeybioContext = {
      cloudflare: {
        env,
        ctx,
      },
    };

    const response = await requestHandler(
      request,
      context,
    );

    return applySecurityHeaders(
      request,
      response,
    );
  },

  async scheduled(
    controller: ScheduledController,
    env: HeybioBindings,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runBillingJobs(env)
        .then((result) => {
          console.info(
            "HEYBIO billing scheduled run",
            {
              cron: controller.cron,
              claimed: result.claimed,
              processed: result.processed,
              failed: result.failed,
              enabled: result.enabled,
            },
          );
        })
        .catch((error: unknown) => {
          console.error(
            "HEYBIO billing scheduled run failed",
            error instanceof Error
              ? error.message
              : "Unknown billing error",
          );

          throw error;
        }),
    );
  },
};

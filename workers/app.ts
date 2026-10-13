import {
  createRequestHandler
} from "react-router";

import {
  runBillingJobs,
  type BillingJobBindings
} from "../app/lib/payments/billing-jobs.server";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export interface HeybioBindings
  extends BillingJobBindings {
  SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface HeybioContext {
  cloudflare: {
    env: HeybioBindings;
    ctx: ExecutionContext;
  };
}

export default {
  async fetch(
    request: Request,
    env: HeybioBindings,
    ctx: ExecutionContext
  ): Promise<Response> {
    const context: HeybioContext = {
      cloudflare: {
        env,
        ctx
      }
    };

    return requestHandler(
      request,
      context
    );
  },

  async scheduled(
    controller: ScheduledController,
    env: HeybioBindings,
    ctx: ExecutionContext
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
              enabled: result.enabled
            }
          );
        })
        .catch((error: unknown) => {
          console.error(
            "HEYBIO billing scheduled run failed",
            error instanceof Error
              ? error.message
              : "Unknown error"
          );

          throw error;
        })
    );
  }
};

import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

interface HeybioBindings {
  // Future Cloudflare environment bindings are added here.
}

interface HeybioContext {
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

    return requestHandler(request, context);
  }
};
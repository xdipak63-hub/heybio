import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  const stream = await renderToReadableStream(
    <ServerRouter
      context={routerContext}
      url={request.url}
    />,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error(
          "[HEYBIO] Server rendering error:",
          error,
        );
      },
    },
  );

  const userAgent = request.headers.get("user-agent") ?? "";
  const isBot = /bot|crawler|spider|facebookexternalhit/i.test(
    userAgent,
  );

  if (isBot) {
    await stream.allReady;
  }

  responseHeaders.set(
    "Content-Type",
    "text/html; charset=utf-8",
  );

  return new Response(stream, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
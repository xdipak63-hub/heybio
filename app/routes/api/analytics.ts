
import type {
  ActionFunctionArgs,
} from "react-router";

import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

import {
  recordAnalyticsEvent,
} from "../../lib/analytics/events.server";

import {
  parseAnalyticsEvent,
  shouldSkipAnalytics,
} from "../../lib/analytics/privacy.server";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

/**
 * Public, anonymous event intake.
 *
 * Does not return private creator analytics.
 * Does not use browser-submitted owner IDs.
 */
export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(
    request,
    ["POST"],
  );

  requireCsrfProtection(request);

  if (
    shouldSkipAnalytics(request)
  ) {
    return new Response(
      null,
      {
        status: 204,
        headers: RESPONSE_HEADERS,
      },
    );
  }

  const contentType =
    request.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .startsWith("application/json")
  ) {
    return Response.json(
      {
        error: "JSON required",
      },
      {
        status: 415,
        headers: RESPONSE_HEADERS,
      },
    );
  }

  const declaredLength =
    Number(
      request.headers.get(
        "content-length",
      ) ?? "0",
    );

  if (
    !Number.isFinite(declaredLength) ||
    declaredLength > 512
  ) {
    return Response.json(
      {
        error: "Request too large",
      },
      {
        status: 413,
        headers: RESPONSE_HEADERS,
      },
    );
  }

  let event:
    ReturnType<
      typeof parseAnalyticsEvent
    >;

  try {
    const body =
      await request.text();

    if (body.length > 512) {
      return Response.json(
        {
          error: "Request too large",
        },
        {
          status: 413,
          headers: RESPONSE_HEADERS,
        },
      );
    }

    event = parseAnalyticsEvent(
      JSON.parse(body) as unknown,
    );
  } catch {
    return Response.json(
      {
        error: "Malformed request",
      },
      {
        status: 400,
        headers: RESPONSE_HEADERS,
      },
    );
  }

  if (!event) {
    return Response.json(
      {
        error: "Invalid event",
      },
      {
        status: 400,
        headers: RESPONSE_HEADERS,
      },
    );
  }

  try {
    await recordAnalyticsEvent(
      context,
      request,
      event,
    );

    return new Response(
      null,
      {
        status: 204,
        headers: RESPONSE_HEADERS,
      },
    );
  } catch {
    // Never disclose privileged service errors
    // or underlying database details.
    return Response.json(
      {
        error: "Analytics unavailable",
      },
      {
        status: 503,
        headers: RESPONSE_HEADERS,
      },
    );
  }
}
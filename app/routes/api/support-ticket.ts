
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import { requireUser } from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

const CATEGORIES = new Set([
  "general",
  "account",
  "billing",
  "technical",
  "abuse",
  "other",
]);

const MAX_BODY = 12_000;

function json(
  body: Record<string, unknown>,
  status: number,
  headers: Headers,
) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "private, no-store");

  return Response.json(body, {
    status,
    headers: responseHeaders,
  });
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const { data: tickets, error } = await client.supabase
    .from("support_tickets")
    .select("id,subject,category,status,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return json(
      { error: "Could not load your requests." },
      503,
      client.headers,
    );
  }

  return json(
    { tickets: tickets ?? [] },
    200,
    client.headers,
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const { user, client } = await requireUser(request, context);

  const declared = Number(
    request.headers.get("content-length") || 0,
  );

  if (Number.isFinite(declared) && declared > MAX_BODY) {
    return json(
      { error: "Request is too large." },
      413,
      client.headers,
    );
  }

  const contentType =
    request.headers.get("content-type") || "";

  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return json(
      { error: "Unsupported form format." },
      415,
      client.headers,
    );
  }

  let params: URLSearchParams;

  try {
    const raw = await request.text();

    if (raw.length > MAX_BODY) {
      return json(
        { error: "Request is too large." },
        413,
        client.headers,
      );
    }

    params = new URLSearchParams(raw);
  } catch {
    return json(
      { error: "Could not read request." },
      400,
      client.headers,
    );
  }

  const subject = (params.get("subject") || "").trim();
  const message = (params.get("message") || "").trim();
  const category = (params.get("category") || "general").trim();

  if (
    subject.length < 5 ||
    subject.length > 160 ||
    message.length < 10 ||
    message.length > 10_000 ||
    !CATEGORIES.has(category)
  ) {
    return json(
      { error: "Check the subject, category and message." },
      400,
      client.headers,
    );
  }

  // Basic account-scoped throttling.
  // Add Cloudflare WAF/rate-limit enforcement in production.
  // Concurrent requests can race through this check.
  const oneHourAgo = new Date(
    Date.now() - 60 * 60 * 1000,
  ).toISOString();

  const { count, error: throttleError } = await client.supabase
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if (throttleError) {
    return json(
      { error: "Support is temporarily unavailable." },
      503,
      client.headers,
    );
  }

  if ((count ?? 0) >= 3) {
    return json(
      {
        error:
          "You've reached the hourly request limit. Please try later.",
      },
      429,
      client.headers,
    );
  }

  const { data: ticket, error } = await client.supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      message,
      category,
      priority: "normal",
      status: "open",
    })
    .select("id,created_at")
    .single();

  if (error || !ticket) {
    return json(
      {
        error:
          "Your request was not saved. Please try again.",
      },
      503,
      client.headers,
    );
  }

  return json(
    {
      ok: true,
      ticketId: ticket.id,
      createdAt: ticket.created_at,
    },
    201,
    client.headers,
  );
}
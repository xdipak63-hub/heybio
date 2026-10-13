import { data } from "react-router";

import type {
  LoaderFunctionArgs,
} from "react-router";

import {
  createSupabaseServer,
} from "../../lib/supabase/server";

const USERNAME_PATTERN =
  /^[a-z][a-z0-9_]{2,29}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "api",
  "auth",
  "billing",
  "callback",
  "contact",
  "dashboard",
  "dipolabs",
  "explore",
  "features",
  "forgot-password",
  "heybio",
  "help",
  "hypedrop",
  "login",
  "logout",
  "news",
  "onboarding",
  "pricing",
  "privacy",
  "reset-password",
  "settings",
  "signup",
  "support",
  "templates",
  "verify-email",
  "www",
]);

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const username = (
    url.searchParams.get("username") ?? ""
  )
    .trim()
    .toLowerCase();

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });

  if (
    !USERNAME_PATTERN.test(username) ||
    RESERVED.has(username)
  ) {
    return data(
      {
        available: false,
        message: "This username cannot be used.",
      },
      { status: 400, headers },
    );
  }

  const client =
    createSupabaseServer(request, context);

  const { data: existing, error } =
    await client.supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .limit(1)
      .maybeSingle();

  if (error) {
    return data(
      {
        available: false,
        message: "Availability is temporarily unavailable.",
      },
      {
        status: 503,
        headers,
      },
    );
  }

  if (existing) {
    return data(
      {
        available: false,
        message: "That username is already taken.",
      },
      { headers },
    );
  }

  return data(
    {
      available: true,
      message: "Looking good! This name is available.",
    },
    { headers },
  );
}
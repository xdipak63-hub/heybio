import {
  data,
  redirect,
  Link,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
} from "react-router";

import {
  createSupabaseServer,
} from "../../lib/supabase/server";

const ALLOWED_DESTINATIONS = new Set([
  "/reset-password",
  "/onboarding/choose-username",
  "/dashboard",
]);

export function meta() {
  return [
    { title: "Verify Account — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { supabase, headers } =
    createSupabaseServer(request, context);

  const url = new URL(request.url);

  const code = url.searchParams.get("code");

  const requestedNext =
    url.searchParams.get("next") ?? "";

  const next =
    ALLOWED_DESTINATIONS.has(requestedNext)
      ? requestedNext
      : "/onboarding/choose-username";

  if (!code) {
    return data(
      {
        error:
          "The verification link is missing or invalid.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    return data(
      {
        error:
          "This verification link has expired " +
          "or could not be completed. " +
          "Please request a new link.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  throw redirect(next, { headers });
}

export default function AuthCallbackPage() {
  const { error } =
    useLoaderData<typeof loader>();

  return (
    <main className="auth-page">
      <div className="auth-content">
        <Link to="/" className="brand">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>

        <div className="auth-card">
          <span className="eyebrow">
            ACCOUNT VERIFICATION
          </span>

          <h1>Link verification failed.</h1>

          <p role="alert">
            {error}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 24,
            }}
          >
            <Link
              to="/login"
              className="button button--dark"
            >
              Back to login
            </Link>

            <Link
              to="/forgot-password"
              className="button"
            >
              Reset password
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
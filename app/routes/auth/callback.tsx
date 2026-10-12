import {
  data,
  redirect,
  Link,
  useLoaderData
} from "react-router";

import type {
  LoaderFunctionArgs
} from "react-router";

import {
  createSupabaseServer
} from "../../lib/supabase/server";

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const { supabase, headers } =
    createSupabaseServer(request, context);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return data(
      {
        error:
          "Verification link is missing or invalid."
      },
      { status: 400, headers }
    );
  }

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    return data(
      {
        error:
          "This verification link could not be completed. Please try logging in or requesting a new link."
      },
      { status: 400, headers }
    );
  }

  throw redirect(
    "/onboarding/choose-username",
    { headers }
  );
}

export default function CallbackPage() {
  const { error } =
    useLoaderData<typeof loader>();

  return (
    <main className="auth-message">
      <Link className="brand" to="/">
        HEYBIO<span className="brand-arrow">↗</span>
      </Link>

      <div className="auth-message__card">
        <span className="eyebrow">
          ACCOUNT VERIFICATION
        </span>

        <h1>Verification update.</h1>
        <p>{error}</p>

        <Link
          to="/login"
          className="button button--dark"
        >
          Go to login ↗
        </Link>
      </div>
    </main>
  );
}
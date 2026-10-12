import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "react-router";

import {
  createSupabaseServer,
  requireSameOrigin
} from "../../lib/supabase/server";

export function meta() {
  return [
    { title: "Log in — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow"
    }
  ];
}

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const { supabase, headers } =
    createSupabaseServer(request, context);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    throw redirect("/dashboard", {
      headers
    });
  }

  return data(null, { headers });
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const form = await request.formData();

  const email = String(
    form.get("email") ?? ""
  ).trim().toLowerCase();

  const password = String(
    form.get("password") ?? ""
  );

  if (
    !email ||
    !password ||
    email.length > 254 ||
    password.length > 128
  ) {
    return data(
      {
        error: "Enter your email and password."
      },
      { status: 400, headers }
    );
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    return data(
      {
        error:
          "Invalid credentials or the account isn't verified."
      },
      { status: 400, headers }
    );
  }

  throw redirect("/dashboard", { headers });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [params] = useSearchParams();

  const submitting =
    navigation.state === "submitting";

  return (
    <main className="auth-layout">
      <div className="auth-panel">
        <Link className="brand" to="/">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>

        <div className="auth-panel__content">
          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h1>Your world awaits.</h1>
          <p>
            Good to have you back. Log in to
            continue creating.
          </p>

          {params.get("verification") ===
            "required" && (
            <div
              className="auth-notice"
              role="status"
            >
              Please verify your email before
              continuing.
            </div>
          )}

          {params.get("verified") === "1" && (
            <div
              className="auth-notice"
              role="status"
            >
              Email verification completed.
              You can now log in.
            </div>
          )}

          <Form method="post" className="auth-form">
            {actionData?.error && (
              <div
                className="auth-error"
                role="alert"
              >
                {actionData.error}
              </div>
            )}

            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="button button--dark auth-submit"
            >
              {submitting
                ? "Logging in..."
                : "Log in ↗"}
            </button>
          </Form>

          <p className="auth-switch">
            New to HEYBIO?{" "}
            <Link to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <aside className="auth-visual">
        <span>HEYBIO BY DIPO LABS</span>
        <div>
          <span className="auth-visual__mark">↗</span>
          <h2>
            Your world.
            <br />
            One link.
          </h2>
          <p>
            Pick up right where you left off.
          </p>
        </div>
        <span>MADE FOR MORE</span>
      </aside>
    </main>
  );
}
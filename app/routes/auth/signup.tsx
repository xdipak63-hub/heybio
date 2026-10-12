import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useNavigation
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
    { title: "Create account — HEYBIO" },
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
    throw redirect("/onboarding/choose-username", {
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

  const name = String(
    form.get("name") ?? ""
  ).trim();

  const email = String(
    form.get("email") ?? ""
  ).trim().toLowerCase();

  const password = String(
    form.get("password") ?? ""
  );

  if (
    name.length < 2 ||
    name.length > 80
  ) {
    return data(
      {
        error: "Enter a name between 2 and 80 characters.",
        success: false
      },
      { status: 400, headers }
    );
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return data(
      {
        error: "Enter a valid email address.",
        success: false
      },
      { status: 400, headers }
    );
  }

  if (
    password.length < 12 ||
    password.length > 128
  ) {
    return data(
      {
        error: "Use a password between 12 and 128 characters.",
        success: false
      },
      { status: 400, headers }
    );
  }

  const origin = new URL(request.url).origin;

  const { data: result, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          display_name: name
        }
      }
    });

  if (error) {
    return data(
      {
        error:
          error.status === 429
            ? "Too many attempts. Please try later."
            : "We couldn't complete signup. Please try again.",
        success: false
      },
      { status: 400, headers }
    );
  }

  if (result.session) {
    throw redirect("/onboarding/choose-username", {
      headers
    });
  }

  return data(
    {
      error: null,
      success: true
    },
    { headers }
  );
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

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
            YOUR WORLD STARTS HERE
          </span>

          <h1>Create your space.</h1>
          <p>
            Everything you are, everything you share.
            One beautiful home.
          </p>

          {actionData?.success ? (
            <div className="auth-notice" role="status">
              Check your email for the verification
              link. After confirming, you can set
              up your HEYBIO profile.
            </div>
          ) : (
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
                Your name
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="What should we call you?"
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="you@example.com"
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  placeholder="At least 12 characters"
                />
              </label>

              <button
                className="button button--dark auth-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Creating account..."
                  : "Create account ↗"}
              </button>
            </Form>
          )}

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

      <aside className="auth-visual">
        <span>HEYBIO BY DIPO LABS</span>
        <div>
          <span className="auth-visual__mark">✳</span>
          <h2>
            A link that
            <br />
            feels like you.
          </h2>
          <p>Your world. One link.</p>
        </div>
        <span>CREATE · CONNECT · EXPRESS</span>
      </aside>
    </main>
  );
}
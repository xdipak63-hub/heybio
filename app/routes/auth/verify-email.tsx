import Logo from "../../components/shared/Logo";
import {
  Form,
  Link,
  data,
  useActionData,
  useNavigation,
} from "react-router";

import type {
  ActionFunctionArgs,
} from "react-router";

import {
  createSupabaseServer,
  requireSameOrigin,
} from "../../lib/supabase/server";

export function meta() {
  return [
    { title: "Verify Email — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const form = await request.formData();

  const email = String(
    form.get("email") ?? "",
  )
    .trim()
    .toLowerCase();

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return data(
      {
        success: false,
        message: "Enter a valid email address.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  const origin = new URL(request.url).origin;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo:
        `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(
      "Email verification resend failed:",
      error.code ?? "unknown",
    );

    return data(
      {
        success: false,
        message:
          "Unable to process this request right now.",
      },
      {
        status: 503,
        headers,
      },
    );
  }

  return data(
    {
      success: true,
      message:
        "If verification is available for this " +
        "account, an email will be sent.",
    },
    { headers },
  );
}

export default function VerifyEmailPage() {
  const actionData =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const submitting =
    navigation.state === "submitting";

  return (
    <main className="auth-page">
      <div className="auth-content">
        <Logo size="sm" className="brand" />

        <div className="auth-card">
          <span className="eyebrow">
            EMAIL VERIFICATION
          </span>

          <h1>Check your inbox.</h1>

          <p>
            HEYBIO requires a verified email
            before accessing your creator account.
            If you need a new verification email,
            enter your address below.
          </p>

          {actionData?.message && (
            <div
              role={
                actionData.success
                  ? "status"
                  : "alert"
              }
              className={
                actionData.success
                  ? "auth-success"
                  : "auth-error"
              }
            >
              {actionData.message}
            </div>
          )}

          <Form
            method="post"
            className="auth-form"
          >
            <label htmlFor="verify-email">
              Email address
            </label>

            <input
              id="verify-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={submitting}
              className="button button--dark auth-submit"
            >
              {submitting
                ? "Sending..."
                : "Resend verification email ↗"}
            </button>
          </Form>

          <p className="auth-switch">
            Already verified?{" "}
            <Link to="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
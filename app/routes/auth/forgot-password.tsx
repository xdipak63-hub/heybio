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

const SUCCESS_MESSAGE =
  "If an account exists for this email, " +
  "you will receive password reset instructions.";

export function meta() {
  return [
    { title: "Forgot Password — HEYBIO" },
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

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (
    !validEmail ||
    email.length > 254
  ) {
    return data(
      {
        success: false,
        message:
          "Enter a valid email address.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  const origin = new URL(request.url).origin;

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          `${origin}/auth/callback` +
          "?next=%2Freset-password",
      },
    );

  if (error) {
    console.error(
      "Password reset request failed:",
      error.code ?? "unknown",
    );

    return data(
      {
        success: false,
        message:
          "We couldn't process your request. " +
          "Please try again later.",
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
      message: SUCCESS_MESSAGE,
    },
    { headers },
  );
}

export default function ForgotPasswordPage() {
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
            ACCOUNT RECOVERY
          </span>

          <h1>Forgot your password?</h1>

          <p>
            Enter your account email address.
            We'll send you a secure recovery link.
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
            <label htmlFor="recovery-email">
              Email address
            </label>

            <input
              id="recovery-email"
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
                : "Send recovery link ↗"}
            </button>
          </Form>

          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
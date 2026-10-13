import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  createSupabaseServer,
  requireSameOrigin,
} from "../../lib/supabase/server";

export function meta() {
  return [
    { title: "Reset Password — HEYBIO" },
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect(
      "/forgot-password?session=expired",
      { headers },
    );
  }

  return data(null, { headers });
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect(
      "/forgot-password?session=expired",
      { headers },
    );
  }

  const form = await request.formData();

  const password = String(
    form.get("password") ?? "",
  );

  const confirmPassword = String(
    form.get("confirmPassword") ?? "",
  );

  if (
    password.length < 12 ||
    password.length > 128
  ) {
    return data(
      {
        error:
          "Password must contain 12–128 characters.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  if (password !== confirmPassword) {
    return data(
      {
        error:
          "Passwords do not match.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    return data(
      {
        error:
          "Unable to update your password. " +
          "Please request a new recovery link.",
      },
      {
        status: 400,
        headers,
      },
    );
  }

  await supabase.auth.signOut({
    scope: "local",
  });

  throw redirect(
    "/login?password=updated",
    { headers },
  );
}

export default function ResetPasswordPage() {
  const actionData =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const submitting =
    navigation.state === "submitting";

  return (
    <main className="auth-page">
      <div className="auth-content">
        <Link to="/" className="brand">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>

        <div className="auth-card">
          <span className="eyebrow">
            SECURE YOUR ACCOUNT
          </span>

          <h1>Create a new password.</h1>

          <p>
            Use a unique password with at
            least 12 characters.
          </p>

          {actionData?.error && (
            <div
              className="auth-error"
              role="alert"
            >
              {actionData.error}
            </div>
          )}

          <Form
            method="post"
            className="auth-form"
          >
            <label htmlFor="new-password">
              New password
            </label>

            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />

            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />

            <button
              type="submit"
              disabled={submitting}
              className="button button--dark auth-submit"
            >
              {submitting
                ? "Updating..."
                : "Update password ↗"}
            </button>
          </Form>

          <p className="auth-switch">
            <Link to="/login">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
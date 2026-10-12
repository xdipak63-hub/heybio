import {
  Form,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "react-router";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin
} from "../../lib/supabase/server";

const USERNAME_REGEX =
  /^[a-z][a-z0-9_]{2,29}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "api",
  "auth",
  "billing",
  "dashboard",
  "dipolabs",
  "heybio",
  "help",
  "hypedrop",
  "login",
  "logout",
  "me",
  "pricing",
  "privacy",
  "root",
  "settings",
  "signup",
  "support",
  "system",
  "www"
]);

function isValidUsername(username: string) {
  return (
    USERNAME_REGEX.test(username) &&
    !RESERVED.has(username)
  );
}

export function meta() {
  return [
    { title: "Choose username — HEYBIO" },
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
  const { user, client } =
    await requireUser(request, context);

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Could not load your profile.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (profile?.username) {
    throw redirect("/dashboard", {
      headers: client.headers
    });
  }

  return data(
    {
      displayName:
        profile?.display_name || "Creator"
    },
    { headers: client.headers }
  );
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { user, client } =
    await requireUser(request, context);

  const form = await request.formData();

  const username = String(
    form.get("username") ?? ""
  ).trim().toLowerCase();

  if (!isValidUsername(username)) {
    return data(
      {
        error:
          "Use 3–30 characters. Start with a letter; use only lowercase letters, numbers or underscores. Reserved names aren't allowed."
      },
      {
        status: 400,
        headers: client.headers
      }
    );
  }

  const { data: existing, error: readError } =
    await client.supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

  if (readError) {
    return data(
      { error: "Please try again." },
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (existing?.username) {
    throw redirect("/dashboard", {
      headers: client.headers
    });
  }

  const { error } = await client.supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username
      },
      { onConflict: "id" }
    );

  if (error) {
    return data(
      {
        error:
          error.code === "23505"
            ? "That username is already taken."
            : "Unable to save username. Try another one."
      },
      {
        status: 409,
        headers: client.headers
      }
    );
  }

  throw redirect("/dashboard", {
    headers: client.headers
  });
}

export default function ChooseUsernamePage() {
  const { displayName } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const submitting =
    navigation.state === "submitting";

  return (
    <main className="onboarding-page">
      <div className="onboarding-card">
        <a className="brand" href="/">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </a>

        <div className="onboarding-card__progress">
          <span>STEP 01 / YOUR IDENTITY</span>
          <div>
            <span />
          </div>
        </div>

        <span className="eyebrow">
          MAKE IT YOURS
        </span>

        <h1>
          Hello, {displayName}.
          <br />
          Claim your link.
        </h1>

        <p>
          This is the name people will remember
          when they visit your HEYBIO.
        </p>

        <Form method="post" className="auth-form">
          {actionData?.error && (
            <div
              className="auth-error"
              role="alert"
            >
              {actionData.error}
            </div>
          )}

          <label htmlFor="username">
            Your username
          </label>

          <div className="username-field">
            <span>@</span>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              pattern="[a-z][a-z0-9_]{2,29}"
              title="3–30 characters, starting with a lowercase letter"
              minLength={3}
              maxLength={30}
              placeholder="yourname"
              required
            />
          </div>

          <p className="field-help">
            Lowercase letters, numbers and underscores.
            3–30 characters.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="button button--dark auth-submit"
          >
            {submitting
              ? "Saving..."
              : "Claim username ↗"}
          </button>
        </Form>
      </div>
    </main>
  );
}
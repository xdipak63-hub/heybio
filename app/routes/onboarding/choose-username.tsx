import { useEffect, useState } from "react";

import {
  Form,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  ArrowUpRight,
  AtSign,
  Check,
  Sparkles,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

const USERNAME_REGEX =
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

export function meta() {
  return [
    { title: "Claim your username — HEYBIO" },
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
      "Unable to load your profile.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (profile?.username) {
    throw redirect("/onboarding/choose-plan", {
      headers: client.headers,
    });
  }

  return data(
    {
      displayName:
        profile?.display_name ?? "Creator",
    },
    { headers: client.headers },
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { user, client } =
    await requireUser(request, context);

  const form = await request.formData();

  const username = String(
    form.get("username") ?? "",
  )
    .trim()
    .toLowerCase();

  if (
    !USERNAME_REGEX.test(username) ||
    RESERVED.has(username)
  ) {
    return data(
      {
        error:
          "Use 3–30 characters, starting with a letter. Only lowercase letters, numbers and underscores are allowed.",
      },
      {
        status: 400,
        headers: client.headers,
      },
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
        headers: client.headers,
      },
    );
  }

  if (existing?.username) {
    throw redirect("/onboarding/choose-plan", {
      headers: client.headers,
    });
  }

  const { error } =
    await client.supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          username,
        },
        { onConflict: "id" },
      );

  if (error) {
    return data(
      {
        error:
          error.code === "23505"
            ? "This username has already been claimed."
            : "Unable to claim this username. Please try again.",
      },
      {
        status: 409,
        headers: client.headers,
      },
    );
  }

  throw redirect("/onboarding/choose-plan", {
    headers: client.headers,
  });
}

export default function ChooseUsernamePage() {
  const { displayName } =
    useLoaderData<typeof loader>();

  const actionData =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const [username, setUsername] = useState("");

  const submitting =
    navigation.state === "submitting";

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "heybio:desired-username",
      );

      if (
        saved &&
        USERNAME_REGEX.test(saved) &&
        !RESERVED.has(saved)
      ) {
        setUsername(saved);
      }
    } catch {
      // Storage is optional.
    }
  }, []);

  return (
    <main className="hb-onboarding">
      <div className="hb-onboarding__card">
        <a href="/" className="hb-header__logo">
          HEYBIO<span>↗</span>
        </a>

        <div className="hb-onboarding__progress">
          <span>YOUR CREATOR JOURNEY</span>
          <span>01 / 02</span>
        </div>

        <div className="hb-onboarding__icon">
          <AtSign size={34} />
        </div>

        <span className="hb-eyebrow">
          YOUR INTERNET IDENTITY
        </span>

        <h1>
          Hello, {displayName}.
          <br />
          <span>Claim your space.</span>
        </h1>

        <p>
          This is the name people will remember
          when they visit your HEYBIO.
        </p>

        <Form method="post" className="hb-onboarding__form">
          {actionData?.error && (
            <div className="hb-onboarding__error" role="alert">
              {actionData.error}
            </div>
          )}

          <label htmlFor="username">
            Your HEYBIO username
          </label>

          <div className="hb-onboarding__field">
            <span>heybio.in/</span>

            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "")
                    .slice(0, 30),
                )
              }
              placeholder="yourname"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <small>
            <Check size={14} />
            3–30 characters. Start with a letter.
          </small>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Claiming your username..."
              : "Claim username"}
            <ArrowUpRight size={20} />
          </button>
        </Form>

        <div className="hb-onboarding__tip">
          <Sparkles size={18} />
          Small beginnings can lead to
          wonderful things.
        </div>
      </div>
    </main>
  );
}
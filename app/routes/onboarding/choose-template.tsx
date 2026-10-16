
import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

import {
  THEME_PRESETS,
} from "../../components/creator/ThemePicker";

const DEFAULT_PRESET = "classic";

const VALID_PRESETS = new Set<string>(
  THEME_PRESETS.map((item) => item.id),
);

export const meta: MetaFunction = () => [
  { title: "Choose your look — HEYBIO" },
  {
    name: "robots",
    content: "noindex, nofollow",
  },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const [profile, storedTheme] =
    await Promise.all([
      client.supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle(),

      client.supabase
        .from("profile_themes")
        .select("preset")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

  if (profile.error || storedTheme.error) {
    throw new Response(
      "Unable to load your templates.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profile.data?.username) {
    throw redirect(
      "/onboarding/choose-username",
      {
        headers: client.headers,
      },
    );
  }

  let customThemes = false;

  try {
    customThemes = (
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "custom_themes",
      )
    ).allowed;
  } catch {
    throw new Response(
      "Plan verification is temporarily unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  const stored =
    storedTheme.data?.preset ??
    DEFAULT_PRESET;

  return data(
    {
      customThemes,
      selected:
        customThemes &&
        VALID_PRESETS.has(stored)
          ? stored
          : DEFAULT_PRESET,
    },
    {
      headers: client.headers,
    },
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

  const preset = String(
    form.get("preset") ?? "",
  );

  if (!VALID_PRESETS.has(preset)) {
    return data(
      {
        error: "Choose a valid template.",
      },
      {
        status: 400,
        headers: client.headers,
      },
    );
  }

  let customThemes = false;

  try {
    customThemes = (
      await getVerifiedFeatureAccess(
        context,
        client.supabase,
        user.id,
        "custom_themes",
      )
    ).allowed;
  } catch {
    return data(
      {
        error:
          "Could not verify your plan. Please try again.",
      },
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (
    preset !== DEFAULT_PRESET &&
    !customThemes
  ) {
    return data(
      {
        error:
          "Custom templates require an active eligible plan.",
      },
      {
        status: 403,
        headers: client.headers,
      },
    );
  }

  // Phase 02 RLS is the final DB authorization boundary.
  const { error } = await client.supabase
    .from("profile_themes")
    .upsert(
      {
        profile_id: user.id,
        preset,
        accent: "#BDF806",
        button_style: "rounded",
      },
      {
        onConflict: "profile_id",
      },
    );

  if (error) {
    return data(
      {
        error:
          "We couldn't save your look. Try again.",
      },
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  throw redirect(
    "/onboarding/complete",
    {
      headers: client.headers,
    },
  );
}

export default function ChooseTemplatePage() {
  const { customThemes, selected } =
    useLoaderData<typeof loader>();

  const response =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const saving =
    navigation.state === "submitting";

  return (
    <main className="hb-workspace">
      <div
        className="hb-workspace__container"
        style={{ maxWidth: 1020 }}
      >
        <Link
          className="hb-workspace__back"
          to="/onboarding/create-profile"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Back to profile
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              CREATOR SETUP / APPEARANCE
            </span>

            <h1>Choose your look.</h1>

            <p>
              Your page starts simple. Change its
              style whenever you're ready.
            </p>
          </div>
        </header>

        {!customThemes && (
          <div
            className="hb-workspace__note"
            role="note"
          >
            <LockKeyhole
              size={19}
              aria-hidden="true"
            />

            <span>
              Classic is included with Free.
              Custom templates unlock with an
              active paid plan.{" "}
              <Link to="/pricing">
                Compare plans
              </Link>.
            </span>
          </div>
        )}

        <Form
          method="post"
          style={{
            display: "grid",
            gap: 22,
          }}
        >
          {response?.error && (
            <p
              role="alert"
              className="auth-error"
            >
              {response.error}
            </p>
          )}

          <fieldset
            style={{
              border: 0,
              padding: 0,
              margin: 0,
            }}
          >
            <legend
              style={{
                fontWeight: 750,
                marginBottom: 18,
              }}
            >
              Select a template
            </legend>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 225px), 1fr))",
                gap: 14,
              }}
            >
              {THEME_PRESETS.map((theme) => {
                const locked =
                  !customThemes &&
                  theme.id !== DEFAULT_PRESET;

                const checked =
                  selected === theme.id;

                return (
                  <label
                    key={theme.id}
                    style={{
                      display: "grid",
                      gap: 12,
                      cursor: locked
                        ? "not-allowed"
                        : "pointer",
                      padding: 18,
                      borderRadius: 20,
                      border: checked
                        ? "2px solid #1D1D1F"
                        : "1px solid #DEDEE3",
                      background: "#FFF",
                      opacity: locked ? 0.62 : 1,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <strong>{theme.name}</strong>

                      {locked ? (
                        <LockKeyhole
                          size={17}
                          aria-label="Paid template"
                        />
                      ) : checked ? (
                        <Check
                          size={18}
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>

                    <span
                      aria-hidden="true"
                      style={{
                        display: "grid",
                        gap: 9,
                        padding: 22,
                        borderRadius: 14,
                        background:
                          theme.background,
                        color: theme.text,
                      }}
                    >
                      <span
                        style={{
                          margin: "auto",
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "currentColor",
                          opacity: 0.2,
                        }}
                      />

                      <span
                        style={{
                          height: 12,
                          borderRadius: 20,
                          background: "currentColor",
                          opacity: 0.3,
                        }}
                      />

                      <span
                        style={{
                          height: 12,
                          borderRadius: 20,
                          background: "currentColor",
                          opacity: 0.3,
                        }}
                      />
                    </span>

                    <input
                      type="radio"
                      name="preset"
                      value={theme.id}
                      defaultChecked={checked}
                      disabled={locked}
                      required={!locked}
                      style={{
                        accentColor: "#1D1D1F",
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            className="hb-workspace__button hb-workspace__button--primary"
            type="submit"
            disabled={saving}
            style={{
              justifySelf: "start",
            }}
          >
            {saving
              ? "Saving…"
              : "Continue"}

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </button>
        </Form>
      </div>
    </main>
  );
}
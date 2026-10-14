
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
  Check,
  ArrowRight,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

import {
  THEME_PRESETS,
} from "../../components/creator/ThemePicker";

const allowed = new Set<string>(
  THEME_PRESETS.map((theme) => theme.id),
);

export function meta() {
  return [
    { title: "Choose a template — HEYBIO" },
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

  const [profileResult, themeResult] =
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

  if (
    profileResult.error ||
    themeResult.error
  ) {
    throw new Response(
      "Unable to load templates.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profileResult.data?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  return data(
    {
      selected:
        themeResult.data?.preset ?? "classic",
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
  const preset = String(
    form.get("preset") ?? "",
  );

  if (!allowed.has(preset)) {
    return data(
      { error: "Select a valid template." },
      {
        status: 400,
        headers: client.headers,
      },
    );
  }

  const { error } = await client.supabase
    .from("profile_themes")
    .upsert(
      {
        profile_id: user.id,
        preset,
        accent: "#BDF806",
        button_style: "rounded",
      },
      { onConflict: "profile_id" },
    );

  if (error) {
    return data(
      {
        error:
          "Template could not be saved. Please try again.",
      },
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  throw redirect(
    "/onboarding/complete",
    { headers: client.headers },
  );
}

export default function ChooseTemplatePage() {
  const { selected } =
    useLoaderData<typeof loader>();

  const actionData =
    useActionData<typeof action>();

  const navigation = useNavigation();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 20px",
        background: "#F5F5F7",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#1D1D1F",
            textDecoration: "none",
          }}
        >
          HEYBIO↗
        </a>

        <p
          style={{
            marginTop: 48,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          CREATOR SETUP / 02
        </p>

        <h1
          style={{
            fontSize: "clamp(36px,6vw,64px)",
            letterSpacing: "-.06em",
            marginBottom: 10,
          }}
        >
          Choose your look.
        </h1>

        <p style={{ color: "#666" }}>
          Your profile. Your personality.
          You can change this later.
        </p>

        <Form method="post">
          {actionData?.error && (
            <p role="alert" style={{ color: "#B42318" }}>
              {actionData.error}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(210px,1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            {THEME_PRESETS.map((theme) => (
              <label
                key={theme.id}
                style={{
                  display: "block",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="preset"
                  value={theme.id}
                  defaultChecked={
                    theme.id === selected
                  }
                  required
                  style={{ marginBottom: 12 }}
                />

                <div
                  style={{
                    background: theme.background,
                    color: theme.text,
                    minHeight: 250,
                    borderRadius: 24,
                    padding: 24,
                    display: "grid",
                    alignContent: "center",
                    justifyItems: "center",
                    gap: 18,
                    border:
                      "1px solid rgba(0,0,0,.1)",
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      background: "#BDF806",
                      display: "grid",
                      placeItems: "center",
                      color: "#171817",
                      fontWeight: 900,
                    }}
                  >
                    H
                  </div>

                  <strong>@yourname</strong>

                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      style={{
                        width: "100%",
                        height: 38,
                        borderRadius: 12,
                        border:
                          "1px solid currentColor",
                        opacity: 0.55,
                      }}
                    />
                  ))}
                </div>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 800,
                  }}
                >
                  <Check size={16} />
                  {theme.name}
                </p>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={
              navigation.state === "submitting"
            }
            style={{
              marginTop: 28,
              padding: "16px 28px",
              border: 0,
              borderRadius: 100,
              background: "#BDF806",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {navigation.state === "submitting"
              ? "Saving..."
              : "Finish setup"}
            <ArrowRight size={18} />
          </button>
        </Form>
      </div>
    </main>
  );
}
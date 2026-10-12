
import { useState } from "react";
import {
  Form,
  Link,
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

import ThemePicker, {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS
} from "../../components/creator/ThemePicker";

import type {
  ProfileTheme
} from "../../components/creator/ThemePicker";

import ProfilePreview from "../../components/creator/ProfilePreview";

import type {
  PublicLink
} from "../../components/creator/ProfilePreview";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin
} from "../../lib/supabase/server";

const DEFAULT_THEME: ProfileTheme = {
  preset: "classic",
  accent: "#BDF806",
  buttonStyle: "rounded"
};

export function meta() {
  return [
    { title: "Appearance — HEYBIO" },
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

  const [profileResult, themeResult, linksResult] =
    await Promise.all([
      client.supabase
        .from("profiles")
        .select("username,display_name,bio")
        .eq("id", user.id)
        .maybeSingle(),

      client.supabase
        .from("profile_themes")
        .select("preset,accent,button_style")
        .eq("profile_id", user.id)
        .maybeSingle(),

      client.supabase
        .from("links")
        .select("id,title,url,description")
        .eq("profile_id", user.id)
        .eq("is_active", true)
        .order("position")
        .order("created_at")
    ]);

  if (
    profileResult.error ||
    themeResult.error ||
    linksResult.error
  ) {
    throw new Response(
      "Unable to load appearance settings.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  const profile = profileResult.data;

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers }
    );
  }

  const storedTheme = themeResult.data;

  const theme: ProfileTheme = storedTheme
    ? {
        preset: storedTheme.preset,
        accent: storedTheme.accent,
        buttonStyle: storedTheme.button_style
      }
    : DEFAULT_THEME;

  return data(
    {
      username: profile.username,
      displayName: profile.display_name ?? "",
      bio: profile.bio ?? "",
      theme,
      links:
        (linksResult.data ?? []) as PublicLink[]
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

  const displayName = String(
    form.get("displayName") ?? ""
  ).trim();

  const bio = String(
    form.get("bio") ?? ""
  ).trim();

  const preset = String(
    form.get("preset") ?? ""
  );

  const accent = String(
    form.get("accent") ?? ""
  );

  const buttonStyle = String(
    form.get("buttonStyle") ?? ""
  );

  function invalid(error: string) {
    return data(
      { error },
      {
        status: 400,
        headers: client.headers
      }
    );
  }

  if (
    displayName.length > 80 ||
    bio.length > 500
  ) {
    return invalid(
      "Display name must be at most 80 characters and bio at most 500 characters."
    );
  }

  if (
    !THEME_PRESETS.some((t) => t.id === preset) ||
    !ACCENT_COLORS.some((c) => c === accent) ||
    !BUTTON_STYLES.some((b) => b.id === buttonStyle)
  ) {
    return invalid("Invalid theme selection.");
  }

  const { data: updated, error: profileError } =
    await client.supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio
      })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

  if (profileError || !updated) {
    return invalid(
      "Unable to save profile details."
    );
  }

  const { data: existingTheme, error: readError } =
    await client.supabase
      .from("profile_themes")
      .select("profile_id")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (readError) {
    return invalid(
      "Unable to save theme settings."
    );
  }

  const themeValues = {
    preset,
    accent,
    button_style: buttonStyle
  };

  const themeResult = existingTheme
    ? await client.supabase
        .from("profile_themes")
        .update(themeValues)
        .eq("profile_id", user.id)
    : await client.supabase
        .from("profile_themes")
        .insert({
          profile_id: user.id,
          ...themeValues
        });

  if (themeResult.error) {
    return invalid(
      "Profile updated, but theme save failed. Please retry."
    );
  }

  throw redirect(
    "/dashboard/appearance?saved=1",
    { headers: client.headers }
  );
}

export default function DashboardAppearance() {
  const initial = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [displayName, setDisplayName] =
    useState(initial.displayName);

  const [bio, setBio] =
    useState(initial.bio);

  const [theme, setTheme] =
    useState<ProfileTheme>(initial.theme);

  const saving = navigation.state === "submitting";

  return (
    <main className="studio-page">
      <header className="studio-header">
        <Link className="brand" to="/">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>

        <nav aria-label="Creator navigation">
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/links">Links</Link>
          <Link
            to="/dashboard/appearance"
            aria-current="page"
          >
            Appearance
          </Link>
        </nav>
      </header>

      <div className="studio-container">
        <div className="studio-page-heading">
          <span className="eyebrow">
            PERSONALIZE YOUR SPACE
          </span>

          <h1>Make it yours.</h1>

          <p>
            Your profile, your identity, your aesthetic.
          </p>
        </div>

        {actionData?.error && (
          <div className="auth-error" role="alert">
            {actionData.error}
          </div>
        )}

        <div className="appearance-layout">
          <Form
            method="post"
            className="appearance-editor"
          >
            <div className="appearance-panel">
              <h2>Profile details</h2>

              <label>
                Display name
                <input
                  name="displayName"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  maxLength={80}
                  placeholder="Your name"
                />
              </label>

              <label>
                Bio
                <textarea
                  name="bio"
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Tell your story..."
                />
              </label>

              <p className="appearance-character-count">
                {bio.length} / 500 characters
              </p>
            </div>

            <div className="appearance-panel">
              <h2>Profile theme</h2>

              <ThemePicker
                value={theme}
                onChange={setTheme}
              />

              <input
                type="hidden"
                name="preset"
                value={theme.preset}
              />

              <input
                type="hidden"
                name="accent"
                value={theme.accent}
              />

              <input
                type="hidden"
                name="buttonStyle"
                value={theme.buttonStyle}
              />
            </div>

            <button
              type="submit"
              className="button button--dark appearance-save"
              disabled={saving}
            >
              {saving
                ? "Saving profile..."
                : "Save appearance ↗"}
            </button>
          </Form>

          <aside className="appearance-preview">
            <div className="appearance-preview__heading">
              <strong>Live Preview</strong>
              <span>YOUR PROFILE</span>
            </div>

            <div className="appearance-preview__frame">
              <ProfilePreview
                compact
                profile={{
                  username: initial.username,
                  displayName,
                  bio,
                  theme,
                  links: initial.links
                }}
              />
            </div>

            <Link
              className="appearance-preview__open"
              to={`/${initial.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open your public page ↗
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
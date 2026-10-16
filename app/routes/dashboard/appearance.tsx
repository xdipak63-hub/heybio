
import { useState } from "react";

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
  LockKeyhole,
  Save,
} from "lucide-react";

import ThemePicker, {
  ACCENT_COLORS,
  BUTTON_STYLES,
  THEME_PRESETS,
  type ProfileTheme,
} from "../../components/creator/ThemePicker";

import ProfilePreview, {
  type PublicLink,
} from "../../components/creator/ProfilePreview";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

import {
  getVerifiedFeatureAccess,
} from "../../lib/creator/access.server";

const DEFAULT_THEME: ProfileTheme = {
  preset: "classic",
  accent: "#BDF806",
  buttonStyle: "rounded",
};

const isDefault = (theme: ProfileTheme) =>
  theme.preset === DEFAULT_THEME.preset &&
  theme.accent === DEFAULT_THEME.accent &&
  theme.buttonStyle === DEFAULT_THEME.buttonStyle;

export const meta: MetaFunction = () => [
  {
    title: "Appearance — HEYBIO",
  },
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

  const [
    profile,
    themeRow,
    linksResult,
  ] = await Promise.all([
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
      .order("created_at"),
  ]);

  if (
    profile.error ||
    themeRow.error ||
    linksResult.error
  ) {
    throw new Response(
      "Unable to load appearance settings.",
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

  const stored = themeRow.data;

  const validPreset =
    THEME_PRESETS.find(
      (t) => t.id === stored?.preset,
    )?.id;

  const validAccent =
    ACCENT_COLORS.find(
      (c) => c === stored?.accent,
    );

  const validButton =
    BUTTON_STYLES.find(
      (b) => b.id === stored?.button_style,
    )?.id;

  const original: ProfileTheme = {
    preset:
      validPreset ?? DEFAULT_THEME.preset,
    accent:
      validAccent ?? DEFAULT_THEME.accent,
    buttonStyle:
      validButton ??
      DEFAULT_THEME.buttonStyle,
  };

  const theme = customThemes
    ? original
    : DEFAULT_THEME;

  const links: PublicLink[] =
    (linksResult.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      description:
        item.description ?? "",
    }));

  return data(
    {
      username: profile.data.username,
      displayName:
        profile.data.display_name ?? "",
      bio:
        profile.data.bio ?? "",
      theme,
      customThemes,
      links,
      saved:
        new URL(request.url)
          .searchParams.get("saved") === "1",
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

  const displayName = String(
    form.get("displayName") ?? "",
  ).trim();

  const bio = String(
    form.get("bio") ?? "",
  ).trim();

  const preset = String(
    form.get("preset") ?? "",
  );

  const accent = String(
    form.get("accent") ?? "",
  );

  const buttonStyle = String(
    form.get("buttonStyle") ?? "",
  );

  const invalid = (
    message: string,
    status = 400,
  ) =>
    data(
      { error: message },
      {
        status,
        headers: client.headers,
      },
    );

  if (
    displayName.length > 80 ||
    bio.length > 500
  ) {
    return invalid(
      "Display name must be 80 characters or fewer, and bio 500 or fewer.",
    );
  }

  const validPreset =
    THEME_PRESETS.find(
      (item) => item.id === preset,
    )?.id;

  const validAccent =
    ACCENT_COLORS.find(
      (item) => item === accent,
    );

  const validButton =
    BUTTON_STYLES.find(
      (item) => item.id === buttonStyle,
    )?.id;

  if (
    !validPreset ||
    !validAccent ||
    !validButton
  ) {
    return invalid(
      "Choose a valid theme.",
    );
  }

  const theme: ProfileTheme = {
    preset: validPreset,
    accent: validAccent,
    buttonStyle: validButton,
  };

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
    return invalid(
      "Could not verify plan access. Please retry.",
      503,
    );
  }

  if (
    !customThemes &&
    !isDefault(theme)
  ) {
    return invalid(
      "An active paid plan is required for this theme.",
      403,
    );
  }

  // Only modify fields belonging to this user.
  const {
    data: updated,
    error: profileError,
  } = await client.supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio,
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (profileError || !updated) {
    return invalid(
      "Couldn't save profile details.",
      503,
    );
  }

  const {
    error: themeError,
  } = await client.supabase
    .from("profile_themes")
    .upsert(
      {
        profile_id: user.id,
        preset: theme.preset,
        accent: theme.accent,
        button_style: theme.buttonStyle,
      },
      {
        onConflict: "profile_id",
      },
    );

  if (themeError) {
    return invalid(
      "Profile details were saved, but theme could not be saved. Please retry.",
      503,
    );
  }

  throw redirect(
    "/dashboard/appearance?saved=1",
    {
      headers: client.headers,
    },
  );
}

export default function DashboardAppearance() {
  const initial =
    useLoaderData<typeof loader>();

  const response =
    useActionData<typeof action>();

  const navigation =
    useNavigation();

  const [displayName, setDisplayName] =
    useState(initial.displayName);

  const [bio, setBio] =
    useState(initial.bio);

  const [theme, setTheme] =
    useState<ProfileTheme>(initial.theme);

  const saving =
    navigation.state === "submitting";

  return (
    <main className="studio-page">
      <header className="studio-header">
        <Link className="brand" to="/">
          HEYBIO
          <span className="brand-arrow">
            ↗
          </span>
        </Link>

        <nav aria-label="Creator navigation">
          <Link to="/dashboard">
            Overview
          </Link>

          <Link to="/dashboard/links">
            Links
          </Link>

          <Link
            to="/dashboard/appearance"
            aria-current="page"
          >
            Appearance
          </Link>

          <Link to="/dashboard/billing">
            Billing
          </Link>
        </nav>
      </header>

      <div className="studio-container">
        <div className="studio-page-heading">
          <span className="eyebrow">
            YOUR CREATOR SPACE
          </span>

          <h1>Make it yours.</h1>

          <p>
            Shape your page. Every update comes
            from your saved profile.
          </p>
        </div>

        {initial.saved && (
          <p
            role="status"
            className="hb-workspace__status"
          >
            Your changes were saved.
          </p>
        )}

        {response?.error && (
          <p
            role="alert"
            className="auth-error"
          >
            {response.error}
          </p>
        )}

        {!initial.customThemes && (
          <div
            role="note"
            className="hb-workspace__note"
          >
            <LockKeyhole
              size={19}
              aria-hidden="true"
            />

            <span>
              You're using the included Classic
              design. Custom themes require a
              verified paid plan.{" "}
              <Link to="/pricing">
                Compare plans
              </Link>.
            </span>
          </div>
        )}

        <div className="appearance-layout">
          <Form
            method="post"
            className="appearance-editor"
          >
            <section className="appearance-panel">
              <h2>Profile details</h2>

              <label>
                Display name

                <input
                  name="displayName"
                  maxLength={80}
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value,
                    )
                  }
                  placeholder="Your name"
                />
              </label>

              <label>
                Bio

                <textarea
                  name="bio"
                  maxLength={500}
                  rows={4}
                  value={bio}
                  onChange={(event) =>
                    setBio(
                      event.target.value,
                    )
                  }
                  placeholder="Introduce yourself…"
                />
              </label>

              <p className="appearance-character-count">
                {bio.length} / 500 characters
              </p>
            </section>

            <section className="appearance-panel">
              <h2>Profile theme</h2>

              {initial.customThemes ? (
                <ThemePicker
                  value={theme}
                  onChange={setTheme}
                />
              ) : (
                <p>
                  The Classic theme is included
                  with your current plan.
                  Upgrading gives you more
                  appearance options.
                </p>
              )}

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
            </section>

            <button
              type="submit"
              className="button button--dark appearance-save"
              disabled={saving}
            >
              <Save
                size={18}
                aria-hidden="true"
              />

              {saving
                ? "Saving…"
                : "Save changes"}
            </button>
          </Form>

          <aside className="appearance-preview">
            <div className="appearance-preview__heading">
              <strong>Live preview</strong>
              <span>UNSAVED CHANGES</span>
            </div>

            <div className="appearance-preview__frame">
              <ProfilePreview
                compact
                profile={{
                  username: initial.username,
                  displayName,
                  bio,
                  theme,
                  links: initial.links,
                }}
              />
            </div>

            <Link
              className="appearance-preview__open"
              to={`/${encodeURIComponent(
                initial.username,
              )}`}
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
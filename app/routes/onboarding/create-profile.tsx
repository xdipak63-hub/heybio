
import Logo from "../../components/shared/Logo";

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
  ArrowRight,
  UserRound,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

export function meta() {
  return [
    { title: "Create your profile — HEYBIO" },
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
      .select("username,display_name,bio")
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

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  return data(
    {
      username: profile.username,
      displayName: profile.display_name,
      bio: profile.bio,
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

  const displayName = String(
    form.get("displayName") ?? "",
  ).trim();

  const bio = String(
    form.get("bio") ?? "",
  ).trim();

  if (
    displayName.length < 2 ||
    displayName.length > 80 ||
    bio.length > 500
  ) {
    return data(
      {
        error:
          "Name must be 2–80 characters and bio at most 500 characters.",
      },
      {
        status: 400,
        headers: client.headers,
      },
    );
  }

  const { data: updated, error } =
    await client.supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
      })
      .eq("id", user.id)
      .eq("account_status", "active")
      .select("id")
      .maybeSingle();

  if (error || !updated) {
    return data(
      {
        error:
          "Profile could not be saved. Please try again.",
      },
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  throw redirect(
    "/onboarding/choose-template",
    { headers: client.headers },
  );
}

export default function CreateProfilePage() {
  const profile =
    useLoaderData<typeof loader>();

  const actionData =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const submitting =
    navigation.state === "submitting";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F5F7",
        padding: "64px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: 32,
          background: "#FFFFFF",
          borderRadius: 28,
          boxShadow:
            "0 18px 60px rgba(0,0,0,.05)",
        }}
      >
        <Logo size="sm" />

        <div style={{ marginTop: 42 }}>
          <UserRound size={30} />

          <p
            style={{
              color: "#6B6B70",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            CREATOR SETUP / 01
          </p>

          <h1
            style={{
              fontSize: 36,
              letterSpacing: "-.06em",
              lineHeight: 1.1,
            }}
          >
            Make it yours.
          </h1>

          <p style={{ color: "#666" }}>
            Tell your audience a little about
            @{profile.username}.
          </p>
        </div>

        <Form
          method="post"
          style={{
            display: "grid",
            gap: 22,
            marginTop: 30,
          }}
        >
          {actionData?.error && (
            <p role="alert" style={{ color: "#B42318" }}>
              {actionData.error}
            </p>
          )}

          <label
            style={{ display: "grid", gap: 9 }}
          >
            <strong>Display name</strong>

            <input
              name="displayName"
              required
              minLength={2}
              maxLength={80}
              defaultValue={profile.displayName}
              autoComplete="nickname"
              style={{
                padding: 15,
                borderRadius: 14,
                border: "1px solid #DADADA",
              }}
            />
          </label>

          <label
            style={{ display: "grid", gap: 9 }}
          >
            <strong>Bio</strong>

            <textarea
              name="bio"
              rows={4}
              maxLength={500}
              defaultValue={profile.bio}
              placeholder="Creator, artist, founder..."
              style={{
                padding: 15,
                borderRadius: 14,
                border: "1px solid #DADADA",
                resize: "vertical",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 54,
              border: 0,
              borderRadius: 100,
              background: "#BDF806",
              color: "#1D1D1F",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {submitting
              ? "Saving..."
              : "Continue"}
            <ArrowRight size={19} />
          </button>
        </Form>
      </div>
    </main>
  );
}
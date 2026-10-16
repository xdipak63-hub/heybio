
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
  ArrowUpRight,
  CircleCheck,
  Lock,
  Save,
  UserRound,
} from "lucide-react";

import { requireUser } from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

export const meta: MetaFunction = () => [
  { title: "Account settings — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const { data: profile, error } = await client.supabase
    .from("profiles")
    .select("username,display_name,bio")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Response("Settings unavailable.", {
      status: 503,
      headers: client.headers,
    });
  }

  if (!profile?.username) {
    throw redirect("/onboarding/choose-username", {
      headers: client.headers,
    });
  }

  return data(
    {
      username: profile.username,
      displayName: profile.display_name ?? "",
      bio: profile.bio ?? "",
      email: user.email ?? "",
      saved:
        new URL(request.url).searchParams.get("saved") ===
        "1",
    },
    { headers: client.headers },
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const { user, client } = await requireUser(request, context);

  const form = await request.formData();

  const displayName = String(
    form.get("displayName") ?? "",
  ).trim();

  const bio = String(
    form.get("bio") ?? "",
  ).trim();

  const fail = (
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
    displayName.length < 2 ||
    displayName.length > 80 ||
    bio.length > 500
  ) {
    return fail(
      "Display name must be 2–80 characters, bio at most 500.",
    );
  }

  const { data: updated, error } = await client.supabase
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
    return fail(
      "Could not save your profile settings.",
      503,
    );
  }

  throw redirect("/dashboard/settings?saved=1", {
    headers: client.headers,
  });
}

export default function DashboardSettings() {
  const profile = useLoaderData<typeof loader>();
  const feedback = useActionData<typeof action>();
  const navigation = useNavigation();

  const saving =
    navigation.state === "submitting";

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR CREATOR ACCOUNT
            </span>

            <h1>
              <UserRound size={28} aria-hidden="true" />
              Settings
            </h1>

            <p>
              Update what your audience sees, and
              find your account controls.
            </p>
          </div>
        </header>

        {profile.saved && (
          <p
            role="status"
            className="hb-workspace__status"
          >
            <CircleCheck
              size={18}
              aria-hidden="true"
            />
            Changes saved successfully.
          </p>
        )}

        {feedback?.error && (
          <p
            role="alert"
            style={{ color: "#9B1C1C" }}
          >
            {feedback.error}
          </p>
        )}

        <section
          style={{
            padding: 26,
            border: "1px solid #DEDEE3",
            borderRadius: 22,
            background: "#FFF",
          }}
        >
          <h2 style={{ fontSize: 22 }}>
            Public profile details
          </h2>

          <Form
            method="post"
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              Username

              <input
                value={`@${profile.username}`}
                readOnly
                aria-describedby="username-help"
                style={{
                  padding: 13,
                  background: "#F5F5F7",
                  borderRadius: 10,
                }}
              />

              <span
                id="username-help"
                style={{
                  color: "#5F6067",
                  fontSize: 12,
                }}
              >
                Username changes are not supported
                by the current account schema.
              </span>
            </label>

            <label
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              Display name

              <input
                name="displayName"
                defaultValue={profile.displayName}
                required
                minLength={2}
                maxLength={80}
                style={{
                  padding: 13,
                  borderRadius: 10,
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              Bio

              <textarea
                name="bio"
                defaultValue={profile.bio}
                maxLength={500}
                rows={4}
                style={{
                  padding: 13,
                  borderRadius: 10,
                  resize: "vertical",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="hb-workspace__button hb-workspace__button--primary"
              style={{ justifySelf: "start" }}
            >
              <Save size={17} aria-hidden="true" />
              {saving ? "Saving…" : "Save profile"}
            </button>
          </Form>
        </section>

        <section
          style={{
            marginTop: 20,
            padding: 26,
            border: "1px solid #DEDEE3",
            borderRadius: 22,
            background: "#FFF",
          }}
        >
          <h2 style={{ fontSize: 22 }}>
            Account & privacy
          </h2>

          <p
            style={{
              color: "#5F6067",
              overflowWrap: "anywhere",
            }}
          >
            Signed in as {profile.email}
          </p>

          <div className="hb-workspace__actions">
            <Link
              className="hb-workspace__button"
              to="/dashboard/security"
            >
              <Lock size={17} aria-hidden="true" />
              Security
            </Link>

            <Link
              className="hb-workspace__button"
              to="/dashboard/integrations"
            >
              Social accounts
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>

            <Link
              className="hb-workspace__button"
              to="/dashboard/billing"
            >
              Billing
            </Link>
          </div>

          <p
            style={{
              color: "#5F6067",
              fontSize: 13,
              lineHeight: 1.6,
              marginTop: 20,
            }}
          >
            Need a username correction, account
            deletion or personal-data request?
            Contact support; account deletion
            must not silently bypass active
            subscription cancellation.
          </p>

          <Link to="/support/submit-ticket?category=account">
            Contact account support →
          </Link>
        </section>
      </div>
    </main>
  );
}
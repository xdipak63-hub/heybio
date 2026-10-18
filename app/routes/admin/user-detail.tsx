
import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  Ban,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";
import { requireAdmin } from "../../lib/auth/require-admin.server";
import {
  requireCsrfProtection,
  requireMutationMethod,
} from "../../lib/security/csrf.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  isApprovedAdminEmail,
} from "../../lib/admin/permissions.server";

import {
  moderateUser,
  ModerationError,
} from "../../lib/admin/moderation.server";

import { formatAdminDate } from "../../types/admin-ui";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Account details — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
  params,
}: LoaderFunctionArgs) {
  const admin = await requireAdminPage(
    request,
    context,
    "users.read",
  );

  if (!params.userId || !UUID.test(params.userId)) {
    throw new Response("Account not found.", {
      status: 404,
      headers: HEADERS,
    });
  }

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const [profile, identity, subscriptions] =
    await Promise.all([
      db.from("profiles")
        .select(
          "id,username,display_name,bio,account_status,created_at,updated_at",
        )
        .eq("id", params.userId)
        .maybeSingle(),

      db.auth.admin.getUserById(params.userId),

      db.from("subscriptions")
        .select(
          "id,plan_id,status,current_period_end,created_at",
        )
        .eq("user_id", params.userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (
    profile.error ||
    identity.error ||
    subscriptions.error
  ) {
    throw new Response(
      "Account details unavailable.",
      { status: 503, headers: HEADERS },
    );
  }

  if (!profile.data || !identity.data.user) {
    throw new Response("Account not found.", {
      status: 404,
      headers: HEADERS,
    });
  }

  const email = identity.data.user.email ?? "";

  return data(
    {
      profile: profile.data,
      email,
      emailVerified: Boolean(
        identity.data.user.email_confirmed_at,
      ),
      protectedAccount:
        params.userId === admin.user.id ||
        isApprovedAdminEmail(email),
      subscriptions: subscriptions.data ?? [],
      updated:
        new URL(request.url).searchParams.get(
          "updated",
        ) === "1",
    },
    { headers: HEADERS },
  );
}

export async function action({
  request,
  context,
  params,
}: ActionFunctionArgs) {
  requireMutationMethod(request, ["POST"]);
  requireCsrfProtection(request);

  const admin = await requireAdmin(
    request,
    context,
    "users.moderate",
  );

  if (!params.userId || !UUID.test(params.userId)) {
    throw new Response("Not found", {
      status: 404,
      headers: HEADERS,
    });
  }

  const form = await request.formData();
  const operation = form.get("operation");

  const reason = String(
    form.get("reason") ?? "",
  ).trim();

  const confirmed = form.get("confirm") === "yes";

  if (
    (operation !== "suspend" &&
      operation !== "restore") ||
    reason.length < 5 ||
    reason.length > 2000 ||
    !confirmed
  ) {
    return data(
      {
        error:
          "Choose an action, explain why (5–2000 characters), and confirm.",
      },
      { status: 400, headers: HEADERS },
    );
  }

  if (params.userId === admin.user.id) {
    return data(
      {
        error:
          "You cannot moderate your own account.",
      },
      { status: 403, headers: HEADERS },
    );
  }

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const identity = await db.auth.admin.getUserById(
    params.userId,
  );

  if (identity.error || !identity.data.user) {
    return data(
      {
        error:
          "Account identity could not be verified.",
      },
      { status: 503, headers: HEADERS },
    );
  }

  if (
    isApprovedAdminEmail(identity.data.user.email)
  ) {
    return data(
      {
        error:
          "Owner identities cannot be moderated here.",
      },
      { status: 403, headers: HEADERS },
    );
  }

  try {
    await moderateUser(context, admin, {
      userId: params.userId,
      action: operation,
      reason,
    });

    throw redirect(
      `/admin/users/${params.userId}?updated=1`,
      { headers: HEADERS },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof ModerationError) {
      return data(
        { error: error.message },
        {
          status: error.status,
          headers: HEADERS,
        },
      );
    }

    return data(
      {
        error:
          "Moderation unavailable. No success was confirmed.",
      },
      { status: 503, headers: HEADERS },
    );
  }
}

export default function AdminUserDetail() {
  const {
    profile,
    email,
    emailVerified,
    protectedAccount,
    subscriptions,
    updated,
  } = useLoaderData<typeof loader>();

  const result = useActionData<typeof action>();
  const navigation = useNavigation();

  const busy = navigation.state === "submitting";

  const panel = {
    padding: 24,
    background: "#fff",
    border: "1px solid #dedee3",
    borderRadius: 20,
  } as const;

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
        maxWidth: 960,
      }}
    >
      <Link to="/admin/users">
        <ArrowLeft
          size={16}
          style={{ verticalAlign: "middle" }}
        />{" "}
        All users
      </Link>

      <header>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          ACCOUNT REVIEW
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "8px 0",
          }}
        >
          {profile.display_name || "Unnamed creator"}
        </h2>

        <p>
          @{profile.username || "not-claimed"} ·{" "}
          {profile.account_status}
        </p>
      </header>

      {updated && (
        <p
          role="status"
          style={{
            ...panel,
            background: "#BDF806",
          }}
        >
          The database confirmed the moderation
          operation. Review the audit log for its
          record.
        </p>
      )}

      <section
        style={panel}
        aria-label="Account information"
      >
        <h3>Account details</h3>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(120px,1fr) minmax(0,2fr)",
            gap: 14,
            overflowWrap: "anywhere",
          }}
        >
          <dt>User ID</dt>
          <dd style={{ margin: 0 }}>
            {profile.id}
          </dd>

          <dt>Email</dt>
          <dd style={{ margin: 0 }}>
            {email || "Unknown"}
          </dd>

          <dt>Verified email</dt>
          <dd style={{ margin: 0 }}>
            {emailVerified ? "Yes" : "No"}
          </dd>

          <dt>Joined</dt>
          <dd style={{ margin: 0 }}>
            {formatAdminDate(profile.created_at)}
          </dd>

          <dt>Last profile edit</dt>
          <dd style={{ margin: 0 }}>
            {formatAdminDate(profile.updated_at)}
          </dd>
        </dl>
      </section>

      <section style={panel}>
        <h3>Latest subscription records</h3>

        {subscriptions.length ? (
          <ul>
            {subscriptions.map((s) => (
              <li key={s.id}>
                {s.plan_id} · {s.status} ·
                period ends{" "}
                {formatAdminDate(s.current_period_end)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No paid subscription records.</p>
        )}
      </section>

      <section style={panel}>
        <h3>Moderation</h3>

        {protectedAccount ? (
          <p>
            <ShieldAlert
              size={18}
              style={{ verticalAlign: "middle" }}
            />{" "}
            Protected owner identity.
            Moderation disabled.
          </p>
        ) : profile.account_status === "deleted" ? (
          <p>
            This account is marked deleted.
            Restore/deletion is not supported here.
          </p>
        ) : (
          <>
            <p>
              Any change requires a documented
              reason. The existing server RPC
              performs the mutation and writes
              the moderation/audit records.
            </p>

            <Form
              method="post"
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <label>
                Action

                <select
                  name="operation"
                  required
                  defaultValue=""
                  style={{
                    padding: 12,
                    display: "block",
                    width: "100%",
                    maxWidth: 360,
                  }}
                >
                  <option value="" disabled>
                    Choose an action
                  </option>

                  {profile.account_status ===
                    "active" && (
                    <option value="suspend">
                      Suspend account
                    </option>
                  )}

                  {profile.account_status ===
                    "suspended" && (
                    <option value="restore">
                      Restore account
                    </option>
                  )}
                </select>
              </label>

              <label>
                Reason (audited)

                <textarea
                  name="reason"
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={4}
                  placeholder="Describe the policy, incident or review outcome"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  name="confirm"
                  value="yes"
                  required
                />

                I have reviewed the account
                and authorize this action.
              </label>

              {result?.error && (
                <p role="alert">
                  {result.error}
                </p>
              )}

              <button
                disabled={busy}
                type="submit"
                style={{
                  justifySelf: "start",
                  padding: "12px 20px",
                  border: 0,
                  borderRadius: 10,
                  background: "#1D1D1F",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {profile.account_status ===
                "active" ? (
                  <Ban
                    size={17}
                    style={{
                      verticalAlign: "middle",
                    }}
                  />
                ) : (
                  <RotateCcw
                    size={17}
                    style={{
                      verticalAlign: "middle",
                    }}
                  />
                )}

                {busy
                  ? " Verifying…"
                  : " Confirm moderation"}
              </button>
            </Form>
          </>
        )}
      </section>
    </div>
  );
}
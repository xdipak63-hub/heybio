
import {
  Form,
  Link,
  data,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  {
    title: "Account security — HEYBIO",
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
    factors,
    assurance,
  ] = await Promise.all([
    client.supabase.auth.mfa.listFactors(),
    client.supabase.auth.mfa
      .getAuthenticatorAssuranceLevel(),
  ]);

  if (
    factors.error ||
    assurance.error
  ) {
    throw new Response(
      "Account security settings are temporarily unavailable.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  return data(
    {
      email:
        user.email ?? "",

      verifiedEmail:
        Boolean(user.email_confirmed_at),

      factorCount:
        factors.data.totp.filter(
          (factor) =>
            factor.status === "verified",
        ).length,

      sessionAssurance:
        assurance.data.currentLevel,

      lastSignIn:
        user.last_sign_in_at ?? null,
    },
    {
      headers: client.headers,
    },
  );
}

function date(value: string | null) {
  if (!value) return "Not available";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
}

export default function DashboardSecurity() {
  const account =
    useLoaderData<typeof loader>();

  const mfaEnabled =
    account.factorCount > 0;

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR ACCOUNT
            </span>

            <h1>
              <ShieldCheck
                size={29}
                aria-hidden="true"
              />
              Security
            </h1>

            <p>
              Protect your HEYBIO account
              and manage sign-in safeguards.
            </p>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <section
            style={{
              padding: 25,
              borderRadius: 20,
              border:
                "1px solid #DEDEE3",
              background: "#FFF",
            }}
          >
            <h2
              style={{
                fontSize: 21,
                margin: "0 0 16px",
              }}
            >
              Account identity
            </h2>

            <dl
              style={{
                display: "grid",
                gap: 12,
                margin: 0,
              }}
            >
              <div>
                <dt
                  style={{
                    fontSize: 13,
                    color: "#5F6067",
                  }}
                >
                  Signed-in email
                </dt>

                <dd
                  style={{
                    margin: "5px 0 0",
                    overflowWrap: "anywhere",
                    fontWeight: 650,
                  }}
                >
                  {account.email}
                </dd>
              </div>

              <div>
                <dt
                  style={{
                    fontSize: 13,
                    color: "#5F6067",
                  }}
                >
                  Email verification
                </dt>

                <dd
                  style={{
                    margin: "5px 0 0",
                    fontWeight: 650,
                  }}
                >
                  {account.verifiedEmail
                    ? "Verified"
                    : "Not verified"}
                </dd>
              </div>

              <div>
                <dt
                  style={{
                    fontSize: 13,
                    color: "#5F6067",
                  }}
                >
                  Last sign-in
                </dt>

                <dd
                  style={{
                    margin: "5px 0 0",
                    fontWeight: 650,
                  }}
                >
                  {date(account.lastSignIn)}
                </dd>
              </div>
            </dl>
          </section>

          <section
            style={{
              padding: 25,
              borderRadius: 20,
              border:
                "1px solid #DEDEE3",
              background: "#FFF",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 21,
                margin: "0 0 12px",
              }}
            >
              <LockKeyhole
                size={22}
                aria-hidden="true"
              />

              Two-factor authentication
            </h2>

            <p
              style={{
                lineHeight: 1.65,
                color: "#5F6067",
              }}
            >
              {mfaEnabled
                ? `You have ${account.factorCount} verified authenticator ${
                    account.factorCount === 1
                      ? "factor"
                      : "factors"
                  }.`
                : "Add an authenticator app to make account sign-in more secure."}
            </p>

            <p
              style={{
                fontSize: 13,
              }}
            >
              Current browser assurance:{" "}
              <strong>
                {account.sessionAssurance === "aal2"
                  ? "MFA verified (AAL2)"
                  : "Standard session (AAL1)"}
              </strong>
            </p>

            <div
              className="hb-workspace__actions"
              style={{
                marginTop: 18,
              }}
            >
              <Link
                className="hb-workspace__button hb-workspace__button--primary"
                to={
                  mfaEnabled
                    ? "/auth/mfa-verify"
                    : "/auth/mfa-setup"
                }
              >
                {mfaEnabled
                  ? "Verify authenticator"
                  : "Set up authenticator"}
              </Link>
            </div>
          </section>

          <section
            style={{
              padding: 25,
              borderRadius: 20,
              border:
                "1px solid #DEDEE3",
              background: "#FFF",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 21,
                margin: "0 0 12px",
              }}
            >
              <KeyRound
                size={22}
                aria-hidden="true"
              />

              Password & session
            </h2>

            <p
              style={{
                lineHeight: 1.65,
                color: "#5F6067",
              }}
            >
              Use the verified email recovery
              flow to reset your password.
              Signing out ends this browser session.
            </p>

            <div
              className="hb-workspace__actions"
              style={{
                marginTop: 18,
              }}
            >
              <Link
                className="hb-workspace__button"
                to="/forgot-password"
              >
                Reset password
              </Link>

              <Form
                action="/logout"
                method="post"
              >
                <button
                  type="submit"
                  className="hb-workspace__button"
                >
                  <LogOut
                    size={17}
                    aria-hidden="true"
                  />

                  Log out
                </button>
              </Form>
            </div>
          </section>
        </div>

        <p
          className="hb-workspace__fine"
          style={{
            marginTop: 22,
          }}
        >
          Never share passwords, verification
          codes or authenticator recovery
          details with support.
        </p>
      </div>
    </main>
  );
}
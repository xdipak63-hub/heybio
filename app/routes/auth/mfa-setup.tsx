
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  ShieldCheck,
} from "lucide-react";

import {
  getSupabaseBrowserClient,
} from "../../lib/supabase/browser";

type Enrollment = {
  factorId: string;
  uri: string;
  secret: string;
};

export function meta() {
  return [
    { title: "Set up MFA — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export default function MfaSetupPage() {
  const [enrollment, setEnrollment] =
    useState<Enrollment | null>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase =
          getSupabaseBrowserClient();

        const { data, error } =
          await supabase.auth.getUser();

        if (
          error ||
          !data.user?.email_confirmed_at
        ) {
          if (!cancelled) {
            window.location.assign("/login");
          }
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to verify your session.",
          );
        }
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enroll() {
    setBusy(true);
    setError("");

    try {
      const supabase =
        getSupabaseBrowserClient();

      const { data: auth } =
        await supabase.auth.getUser();

      if (!auth.user?.email_confirmed_at) {
        throw new Error("Sign in first.");
      }

      const { data, error } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "HEYBIO Authenticator",
        });

      if (error || !data?.totp) {
        throw new Error(
          error?.message ??
            "Could not start MFA setup.",
        );
      }

      setEnrollment({
        factorId: data.id,
        uri: data.totp.uri,
        secret: data.totp.secret,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "MFA setup failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!enrollment) return;

    setBusy(true);
    setError("");

    try {
      const supabase =
        getSupabaseBrowserClient();

      const { data: challenge, error } =
        await supabase.auth.mfa.challenge({
          factorId: enrollment.factorId,
        });

      if (error || !challenge) {
        throw new Error(
          error?.message ??
            "Unable to create challenge.",
        );
      }

      const result =
        await supabase.auth.mfa.verify({
          factorId: enrollment.factorId,
          challengeId: challenge.id,
          code: code.trim(),
        });

      if (result.error) {
        throw result.error;
      }

      setEnrollment(null);
      setCode("");
      setSuccess(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Verification failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F5F7",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 490,
          padding: 32,
          borderRadius: 28,
          background: "#FFFFFF",
        }}
      >
        <ShieldCheck
          size={38}
          color="#648900"
        />

        <h1>Secure your account.</h1>

        <p style={{ color: "#666" }}>
          Add an authenticator app as a second
          verification factor.
        </p>

        {error && (
          <p role="alert" style={{ color: "#B42318" }}>
            {error}
          </p>
        )}

        {success ? (
          <div role="status">
            <h2>MFA enabled.</h2>
            <p>
              Your authenticator has been verified.
            </p>
            <Link to="/dashboard">
              Continue to dashboard
            </Link>
          </div>
        ) : !enrollment ? (
          <button
            type="button"
            disabled={busy}
            onClick={enroll}
            style={{
              padding: "15px 24px",
              border: 0,
              borderRadius: 100,
              background: "#BDF806",
              fontWeight: 800,
            }}
          >
            {busy
              ? "Preparing..."
              : "Set up authenticator"}
          </button>
        ) : (
          <div>
            <p>
              Add this account manually to your
              authenticator app:
            </p>

            <code
              style={{
                display: "block",
                padding: 14,
                background: "#F5F5F7",
                borderRadius: 12,
                overflowWrap: "anywhere",
                userSelect: "all",
              }}
            >
              {enrollment.secret}
            </code>

            <p
              style={{
                fontSize: 12,
                color: "#666",
                overflowWrap: "anywhere",
              }}
            >
              Authenticator URI: {enrollment.uri}
            </p>

            <label
              style={{
                display: "grid",
                gap: 9,
                marginTop: 20,
              }}
            >
              Six-digit code

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #DDD",
                }}
              />
            </label>

            <button
              type="button"
              onClick={verify}
              disabled={
                busy || !/^\d{6}$/.test(code)
              }
              style={{
                marginTop: 20,
                padding: "14px 24px",
                border: 0,
                borderRadius: 100,
                background: "#BDF806",
                fontWeight: 800,
              }}
            >
              {busy
                ? "Verifying..."
                : "Verify and enable"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
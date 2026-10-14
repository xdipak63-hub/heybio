
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  LockKeyhole,
} from "lucide-react";

import {
  getSupabaseBrowserClient,
} from "../../lib/supabase/browser";

type Factor = {
  id: string;
  friendly_name?: string;
};

export function meta() {
  return [
    { title: "Verify MFA — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export default function MfaVerifyPage() {
  const [factor, setFactor] =
    useState<Factor | null>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function loadFactor() {
      try {
        const supabase =
          getSupabaseBrowserClient();

        const { data: auth } =
          await supabase.auth.getUser();

        if (!auth.user) {
          window.location.assign("/login");
          return;
        }

        const { data, error } =
          await supabase.auth.mfa.listFactors();

        if (error) throw error;

        const selected =
          data.totp.find(
            (item) =>
              item.status === "verified",
          );

        if (active) {
          if (selected) {
            setFactor({
              id: selected.id,
              friendly_name:
                selected.friendly_name,
            });
          } else {
            setError(
              "No verified authenticator found.",
            );
          }
        }
      } catch {
        if (active) {
          setError(
            "Unable to load MFA settings.",
          );
        }
      }
    }

    void loadFactor();

    return () => {
      active = false;
    };
  }, []);

  async function submit() {
    if (!factor || !/^\d{6}$/.test(code)) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const supabase =
        getSupabaseBrowserClient();

      const { data: challenge, error } =
        await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

      if (error || !challenge) {
        throw new Error(
          "Unable to start verification.",
        );
      }

      const result =
        await supabase.auth.mfa.verify({
          factorId: factor.id,
          challengeId: challenge.id,
          code,
        });

      if (result.error) {
        throw result.error;
      }

      const assurance =
        await supabase.auth.mfa
          .getAuthenticatorAssuranceLevel();

      if (
        assurance.error ||
        assurance.data.currentLevel !== "aal2"
      ) {
        throw new Error(
          "MFA assurance was not confirmed.",
        );
      }

      setVerified(true);
      setCode("");
    } catch {
      setError(
        "Invalid or expired code. Try again.",
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
          maxWidth: 450,
          background: "#FFFFFF",
          borderRadius: 28,
          padding: 34,
        }}
      >
        <LockKeyhole
          size={38}
          color="#648900"
        />

        <h1>One more step.</h1>

        <p style={{ color: "#666" }}>
          Enter the six-digit code from your
          authenticator app.
        </p>

        {error && (
          <p role="alert" style={{ color: "#B42318" }}>
            {error}
          </p>
        )}

        {verified ? (
          <div role="status">
            <h2>Verification successful.</h2>
            <p>
              Your current browser session has
              reached MFA assurance level AAL2.
            </p>
            <Link to="/dashboard">
              Continue
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 9,
              }}
            >
              Verification code

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
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
                  padding: 15,
                  borderRadius: 13,
                  border: "1px solid #DDD",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={
                busy ||
                !factor ||
                !/^\d{6}$/.test(code)
              }
              style={{
                marginTop: 22,
                padding: "15px 24px",
                width: "100%",
                border: 0,
                borderRadius: 100,
                background: "#BDF806",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {busy
                ? "Verifying..."
                : "Verify identity"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
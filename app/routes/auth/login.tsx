
import { useState } from "react";
import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import TurnstileField from "../../components/auth/TurnstileField";

import {
  createSupabaseServer,
  requireSameOrigin,
} from "../../lib/supabase/server";

import {
  getTurnstileSiteKey,
  verifyTurnstile,
} from "../../lib/security/turnstile.server";

import "../../styles/heybio-auth-next.css";

export function meta() {
  return [
    { title: "Welcome back — HEYBIO" },
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
  const { supabase, headers } =
    createSupabaseServer(request, context);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    throw redirect("/dashboard", {
      headers,
    });
  }

  return data(
    { siteKey: getTurnstileSiteKey(context) },
    { headers },
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { supabase, headers } =
    createSupabaseServer(request, context);

  const form = await request.formData();

  const intent = String(
    form.get("intent") ?? "",
  );

  const fail = (
    error: string,
    status: 400 | 503 = 400,
  ) =>
    data(
      {
        error,
        retryKey: Date.now(),
      },
      { status, headers },
    );

  if (intent === "google") {
    const callback = new URL(
      "/auth/callback",
      request.url,
    );

    callback.searchParams.set(
      "next",
      "/dashboard",
    );

    const {
      data: oauth,
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
      },
    });

    if (error || !oauth.url) {
      return fail(
        "Google sign-in couldn't start. Check OAuth settings and retry.",
        503,
      );
    }

    throw redirect(oauth.url, {
      headers,
    });
  }

  if (intent !== "email") {
    return fail("Unknown sign-in method.");
  }

  const email = String(
    form.get("email") ?? "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    form.get("password") ?? "",
  );

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !password ||
    password.length > 128
  ) {
    return fail(
      "Enter a valid email and password.",
    );
  }

  const verdict = await verifyTurnstile(
    request,
    context,
    String(
      form.get("cf-turnstile-response") ?? "",
    ),
  );

  if (!verdict.ok) {
    return fail(
      verdict.message,
      verdict.status,
    );
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return fail(
      error.status === 429
        ? "Too many attempts. Try again later."
        : "Incorrect credentials or email not verified.",
    );
  }

  throw redirect("/dashboard", {
    headers,
  });
}

export default function LoginPage() {
  const { siteKey } =
    useLoaderData<typeof loader>();

  const result =
    useActionData<typeof action>();

  const navigation = useNavigation();
  const [params] = useSearchParams();

  const [step, setStep] = useState<
    "choose" | "email"
  >("choose");

  const [verified, setVerified] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const submitting =
    navigation.state === "submitting";

  return (
    <main className="hb-a hb-a--login">
      <div className="hb-a__workspace">
        <header className="hb-a__top">
          <Link
            to="/"
            className="hb-a__logo"
            aria-label="HEYBIO homepage"
          >
            HEYBIO
            <span aria-hidden="true"> ↗</span>
          </Link>

          <span className="hb-a__top-note">
            YOUR WORLD. ONE LINK.
          </span>
        </header>

        <section
          className="hb-a__content"
          aria-labelledby="hb-auth-title"
        >
          <div
            className="hb-a__pane"
            key={step}
          >
            <p className="hb-a__eyebrow">
              {step === "choose"
                ? "WELCOME BACK"
                : "SIGN IN SECURELY"}
            </p>

            <h1 id="hb-auth-title">
              {step === "choose" ? (
                <>
                  Good to have
                  <br />
                  <em>you back.</em>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  <em>home.</em>
                </>
              )}
            </h1>

            <p className="hb-a__desc">
              {step === "choose"
                ? "Your page, your links, your world. Right where you left them."
                : "Enter your details to manage your HEYBIO page."}
            </p>

            {params.get("verification") ===
              "required" && (
              <p
                className="hb-a__notice"
                role="status"
              >
                Verify your email first,
                then log in.
              </p>
            )}

            {params.get("verified") ===
              "1" && (
              <p
                className="hb-a__notice"
                role="status"
              >
                Email verified.
                You're ready to log in.
              </p>
            )}

            {result?.error && (
              <p
                className="hb-a__error"
                role="alert"
              >
                {result.error}
              </p>
            )}

            {step === "choose" ? (
              <div className="hb-a__actions">
                <Form method="post">
                  <button
                    type="submit"
                    name="intent"
                    value="google"
                    className="hb-a__google"
                    disabled={submitting}
                  >
                    <span
                      className="hb-a__google-mark"
                      aria-hidden="true"
                    >
                      G
                    </span>

                    {submitting
                      ? "Connecting to Google…"
                      : "Continue with Google"}
                  </button>
                </Form>

                <div className="hb-a__divider">
                  <span>or</span>
                </div>

                <button
                  className="hb-a__primary"
                  type="button"
                  onClick={() =>
                    setStep("email")
                  }
                >
                  Log in with email
                  <ArrowRight size={19} />
                </button>

                <p className="hb-a__small">
                  Your account stays yours.
                  Always.
                </p>
              </div>
            ) : (
              <Form
                method="post"
                className="hb-a__fields"
                replace
              >
                <label className="hb-a__label">
                  Email address

                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    placeholder="you@example.com"
                  />
                </label>

                <label className="hb-a__label">
                  Password

                  <span className="hb-a__password-row">
                    <input
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      maxLength={128}
                      required
                      placeholder="Your password"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (v) => !v,
                        )
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </span>
                </label>

                <div className="hb-a__inline">
                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <TurnstileField
                  siteKey={siteKey}
                  retryKey={
                    result?.retryKey
                  }
                  onVerifiedChange={
                    setVerified
                  }
                />

                <button
                  type="submit"
                  name="intent"
                  value="email"
                  disabled={
                    submitting || !verified
                  }
                  className="hb-a__primary"
                >
                  {submitting
                    ? "Signing you in…"
                    : "Log in"}

                  <ArrowUpRight size={19} />
                </button>

                <button
                  className="hb-a__back"
                  type="button"
                  onClick={() =>
                    setStep("choose")
                  }
                >
                  <ArrowLeft size={16} />
                  Other sign-in options
                </button>
              </Form>
            )}
          </div>

          <p className="hb-a__switch">
            New to HEYBIO?{" "}
            <Link to="/signup">
              Create your page
            </Link>
          </p>
        </section>

        <footer className="hb-a__foot">
          By continuing, you agree to our{" "}
          <Link to="/terms">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy">
            Privacy Policy
          </Link>.
        </footer>
      </div>

      <aside
        className="hb-a__editorial"
        aria-hidden="true"
      >
        <div className="hb-a__editorial-head">
          ONE LINK TO YOUR WORLD
          <ArrowUpRight size={18} />
        </div>

        <div className="hb-a__illustration">
          <div className="hb-a__mini-card hb-a__mini-card--back">
            WELCOME BACK
            <span>↗</span>
          </div>

          <div className="hb-a__mini-card hb-a__mini-card--front">
            <span>HEYBIO ↗</span>

            <strong>
              Everything right where
              you left it.
            </strong>

            <small>
              yourworld · Links · Work · More
            </small>
          </div>
        </div>

        <p>Your world is waiting.</p>
      </aside>
    </main>
  );
}

import Logo from "../../components/shared/Logo";

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
} from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Mail,
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

type Step = "choose" | "identity" | "secure";

export function meta() {
  return [
    { title: "Create your space — HEYBIO" },
    { name: "robots", content: "noindex, nofollow" },
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
    throw redirect("/onboarding/choose-username", {
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
  const intent = String(form.get("intent") ?? "");

  const fail = (
    error: string,
    status: 400 | 503 = 400,
  ) =>
    data(
      {
        error,
        success: false,
        retryKey: Date.now(),
      },
      { status, headers },
    );

  // Google uses provider-side authentication.
  // It must not depend on the email form's Turnstile widget.
  if (intent === "google") {
    const callback = new URL(
      "/auth/callback",
      request.url,
    );

    callback.searchParams.set(
      "next",
      "/onboarding/choose-username",
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
        "Google sign-in couldn't start. Check OAuth settings and try again.",
        503,
      );
    }

    throw redirect(oauth.url, { headers });
  }

  if (intent !== "email") {
    return fail("Unknown sign-up method.");
  }

  const name = String(
    form.get("name") ?? "",
  ).trim();

  const email = String(
    form.get("email") ?? "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    form.get("password") ?? "",
  );

  if (name.length < 2 || name.length > 80) {
    return fail(
      "Enter a name between 2 and 80 characters.",
    );
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return fail("Enter a valid email address.");
  }

  if (
    password.length < 12 ||
    password.length > 128
  ) {
    return fail(
      "Use a password of 12 to 128 characters.",
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

  const callback = new URL(
    "/auth/callback",
    request.url,
  );

  callback.searchParams.set(
    "next",
    "/onboarding/choose-username",
  );

  const {
    data: signup,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callback.toString(),
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    return fail(
      error.status === 429
        ? "Too many attempts. Please try again later."
        : "We couldn't create your account right now. Please try again.",
      error.status === 429 ? 400 : 503,
    );
  }

  if (signup.session) {
    throw redirect(
      "/onboarding/choose-username",
      { headers },
    );
  }

  return data(
    {
      error: null,
      success: true,
      retryKey: 0,
    },
    { headers },
  );
}

export default function SignupPage() {
  const { siteKey } =
    useLoaderData<typeof loader>();

  const result =
    useActionData<typeof action>();

  const navigation = useNavigation();

  const submitting =
    navigation.state === "submitting";

  const [step, setStep] =
    useState<Step>("choose");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [localError, setLocalError] =
    useState("");

  const [verified, setVerified] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  function continueIdentity() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (
      cleanName.length < 2 ||
      cleanName.length > 80
    ) {
      setLocalError(
        "Please enter your name (2–80 characters).",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      ) ||
      cleanEmail.length > 254
    ) {
      setLocalError(
        "Please enter a valid email address.",
      );
      return;
    }

    setName(cleanName);
    setEmail(cleanEmail);
    setLocalError("");
    setStep("secure");
  }

  return (
    <main className="hb-a hb-a--signup">
      <div className="hb-a__workspace">
        <header className="hb-a__top">
          <Logo size="sm" className="hb-a__logo" />

          <span className="hb-a__top-note">
            YOUR WORLD. ONE LINK.
          </span>
        </header>

        <section
          className="hb-a__content"
          aria-labelledby="hb-auth-title"
        >
          {result?.success ? (
            <div className="hb-a__pane hb-a__pane--success">
              <div className="hb-a__success-icon">
                <Mail
                  size={25}
                  aria-hidden="true"
                />
              </div>

              <p className="hb-a__eyebrow">
                ONE MORE STEP
              </p>

              <h1 id="hb-auth-title">
                Check your inbox.
              </h1>

              <p className="hb-a__desc">
                We sent a verification link if
                email delivery is available for
                your account. Open it to continue
                creating your page.
              </p>

              <Link
                className="hb-a__primary hb-a__as-link"
                to="/login"
              >
                Go to log in
                <ArrowUpRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <div
                className="hb-a__pane"
                key={step}
              >
                <div className="hb-a__eyebrow-row">
                  <span className="hb-a__eyebrow">
                    {step === "choose"
                      ? "WELCOME TO HEYBIO"
                      : step === "identity"
                        ? "01 / 02 — THE BASICS"
                        : "02 / 02 — KEEP IT SAFE"}
                  </span>

                  {step !== "choose" && (
                    <span className="hb-a__progress">
                      {step === "identity"
                        ? "● ○"
                        : "● ●"}
                    </span>
                  )}
                </div>

                <h1 id="hb-auth-title">
                  {step === "choose" ? (
                    <>
                      Your space.
                      <br />
                      <em>Your story.</em>
                    </>
                  ) : step === "identity" ? (
                    <>
                      Let's get
                      <br />
                      <em>acquainted.</em>
                    </>
                  ) : (
                    <>
                      Make it
                      <br />
                      <em>official.</em>
                    </>
                  )}
                </h1>

                <p className="hb-a__desc">
                  {step === "choose"
                    ? "Create a beautiful home for everything you share. Start free."
                    : step === "identity"
                      ? "Just your name and email to get started."
                      : "Choose a strong password and secure your account."}
                </p>

                {result?.error && (
                  <p
                    className="hb-a__error"
                    role="alert"
                  >
                    {result.error}
                  </p>
                )}

                {localError && (
                  <p
                    className="hb-a__error"
                    role="alert"
                  >
                    {localError}
                  </p>
                )}

                {step === "choose" && (
                  <div className="hb-a__actions">
                    <Form method="post">
                      <button
                        name="intent"
                        value="google"
                        type="submit"
                        className="hb-a__google"
                        disabled={submitting}
                      >
                        <span
                          className="hb-a__google-mark"
                          aria-hidden="true"
                        >
                          G
                        </span>

                        {submitting &&
                        navigation.formData?.get(
                          "intent",
                        ) === "google"
                          ? "Connecting to Google…"
                          : "Continue with Google"}
                      </button>
                    </Form>

                    <div className="hb-a__divider">
                      <span>or</span>
                    </div>

                    <button
                      type="button"
                      className="hb-a__primary"
                      onClick={() => {
                        setLocalError("");
                        setStep("identity");
                      }}
                    >
                      Continue with email
                      <ArrowRight size={19} />
                    </button>

                    <p className="hb-a__small">
                      Free to start. No payment
                      details required.
                    </p>
                  </div>
                )}

                {step === "identity" && (
                  <div className="hb-a__fields">
                    <label className="hb-a__label">
                      Your name
                      <input
                        autoComplete="name"
                        value={name}
                        maxLength={80}
                        placeholder="What should we call you?"
                        onChange={(e) => {
                          setName(e.target.value);
                          setLocalError("");
                        }}
                      />
                    </label>

                    <label className="hb-a__label">
                      Email address
                      <input
                        autoComplete="email"
                        type="email"
                        inputMode="email"
                        value={email}
                        maxLength={254}
                        placeholder="you@example.com"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setLocalError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            continueIdentity();
                          }
                        }}
                      />
                    </label>

                    <button
                      className="hb-a__primary"
                      type="button"
                      onClick={continueIdentity}
                    >
                      Continue
                      <ArrowRight size={19} />
                    </button>

                    <button
                      className="hb-a__back"
                      type="button"
                      onClick={() => {
                        setLocalError("");
                        setStep("choose");
                      }}
                    >
                      <ArrowLeft size={16} />
                      All sign-up options
                    </button>
                  </div>
                )}

                {step === "secure" && (
                  <Form
                    method="post"
                    className="hb-a__fields"
                    replace
                  >
                    <input
                      type="hidden"
                      name="name"
                      value={name}
                    />

                    <input
                      type="hidden"
                      name="email"
                      value={email}
                    />

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
                          autoComplete="new-password"
                          minLength={12}
                          maxLength={128}
                          required
                          value={password}
                          placeholder="At least 12 characters"
                          onChange={(e) =>
                            setPassword(
                              e.target.value,
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (v) => !v,
                            )
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </span>
                    </label>

                    <p className="hb-a__hint">
                      Use 12+ characters. A unique
                      password is best.
                    </p>

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
                      name="intent"
                      value="email"
                      type="submit"
                      className="hb-a__primary"
                      disabled={
                        !verified ||
                        submitting ||
                        password.length < 12
                      }
                    >
                      {submitting
                        ? "Creating your account…"
                        : "Create my HEYBIO"}
                      <ArrowUpRight size={19} />
                    </button>

                    <button
                      className="hb-a__back"
                      type="button"
                      onClick={() =>
                        setStep("identity")
                      }
                    >
                      <ArrowLeft size={16} />
                      Edit name or email
                    </button>
                  </Form>
                )}
              </div>

              <p className="hb-a__switch">
                Already have an account?{" "}
                <Link to="/login">
                  Log in
                </Link>
              </p>
            </>
          )}
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
          A BETTER HOME FOR YOUR LINKS
          <ArrowUpRight size={18} />
        </div>

        <div className="hb-a__illustration">
          <div className="hb-a__mini-card hb-a__mini-card--back">
            YOUR WORLD
            <span>↗</span>
          </div>

          <div className="hb-a__mini-card hb-a__mini-card--front">
            <span>HEYBIO ↗</span>
            <strong>
              Everything you share.
              Beautifully together.
            </strong>
            <small>
              yourname · Links · Work · More
            </small>
          </div>
        </div>

        <p>
          One link. Many possibilities.
        </p>
      </aside>
    </main>
  );
}

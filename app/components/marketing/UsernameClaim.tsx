import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "api",
  "auth",
  "billing",
  "callback",
  "contact",
  "dashboard",
  "dipolabs",
  "explore",
  "features",
  "forgot-password",
  "heybio",
  "help",
  "hypedrop",
  "login",
  "logout",
  "news",
  "onboarding",
  "pricing",
  "privacy",
  "reset-password",
  "settings",
  "signup",
  "support",
  "templates",
  "verify-email",
  "www",
]);

type AvailabilityResponse = {
  available: boolean;
  message: string;
};

export default function UsernameClaim() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [availability, setAvailability] =
    useState<AvailabilityResponse | null>(null);
  const [checking, setChecking] = useState(false);

  const normalized = username.trim().toLowerCase();
  const valid =
    USERNAME_PATTERN.test(normalized) &&
    !RESERVED.has(normalized);

  useEffect(() => {
    setAvailability(null);

    if (!valid) {
      setChecking(false);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setChecking(true);

      try {
        const response = await fetch(
          `/api/username-availability?username=${encodeURIComponent(
            normalized,
          )}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Availability check failed");
        }

        const result =
          (await response.json()) as AvailabilityResponse;

        setAvailability(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setAvailability({
          available: false,
          message: "Unable to check right now. Try again.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalized, valid]);

  function claim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valid || !availability?.available || checking) {
      return;
    }

    try {
      sessionStorage.setItem(
        "heybio:desired-username",
        normalized,
      );
    } catch {
      // Username can also be entered during onboarding.
    }

    navigate(
      `/signup?username=${encodeURIComponent(normalized)}`,
    );
  }

  return (
    <form
      className="hb-claim"
      onSubmit={claim}
      noValidate
    >
      <label
        htmlFor="hb-username"
        className="hb-claim__label"
      >
        <Sparkles size={16} />
        YOUR INTERNET ADDRESS STARTS HERE
      </label>

      <div className="hb-claim__field">
        <span className="hb-claim__prefix">
          heybio.in/
        </span>

        <input
          id="hb-username"
          name="username"
          value={username}
          onChange={(event) => {
            setUsername(
              event.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "")
                .slice(0, 30),
            );
          }}
          placeholder="yourname"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          minLength={3}
          maxLength={30}
          required
          aria-describedby="hb-claim-feedback"
        />

        {checking ? (
          <LoaderCircle
            className="hb-spin"
            size={20}
            aria-label="Checking"
          />
        ) : availability?.available ? (
          <Check size={20} color="#418500" />
        ) : null}
      </div>

      <div
        id="hb-claim-feedback"
        className="hb-claim__feedback"
        aria-live="polite"
      >
        {username.length > 0 && !valid
          ? "Use 3–30 characters, starting with a letter. Letters, numbers and underscores only."
          : checking
            ? "Checking your username..."
            : availability?.message ??
              "Pick a name that's uniquely yours."}
      </div>

      <button
        type="submit"
        className="hb-claim__button"
        disabled={!availability?.available || checking}
      >
        Claim my HEYBIO
        <ArrowUpRight size={23} />
      </button>

      <p className="hb-claim__fineprint">
        Free to start. No credit card required.
        Username is secured after signup and verification.
      </p>
    </form>
  );
}

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { openHeybioIntro } from "./IntroExperience";

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
    setChecking(false);

    if (!valid) return;

    const controller = new AbortController();
    let active = true;

    const timeout = window.setTimeout(async () => {
      if (!active) return;
      setChecking(true);

      try {
        const response = await fetch(
          `/api/username-availability?username=${encodeURIComponent(
            normalized,
          )}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error("Availability check failed");
        }

        const data: AvailabilityResponse =
          await response.json();

        if (active) {
          setAvailability(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (active) {
          setAvailability({
            available: false,
            message: "Unable to check right now. Try again.",
          });
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalized, valid]);

  const canClaim =
    valid && availability?.available === true && !checking;

  function claim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canClaim) return;

    try {
      sessionStorage.setItem(
        "heybio:desired-username",
        normalized,
      );
    } catch {
      // URL fallback is handled by the intro.
    }

    openHeybioIntro(normalized);
  }

  return (
    <form className="hb-claim" onSubmit={claim} noValidate>
      <label htmlFor="hb-username" className="hb-claim__label">
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
            aria-label="Checking availability"
          />
        ) : canClaim ? (
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
        disabled={!canClaim}
      >
        Claim my HEYBIO
        <ArrowUpRight size={22} />
      </button>

      <p className="hb-claim__fineprint">
        Free to start. No credit card required.
        Username is secured after signup and verification.
      </p>
    </form>
  );
}

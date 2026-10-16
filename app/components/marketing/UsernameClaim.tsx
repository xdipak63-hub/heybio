
import { useEffect, useId, useState } from "react";
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
} from "lucide-react";
import { openHeybioIntro } from "./IntroExperience";

type CheckState =
  | "checking"
  | "available"
  | "taken"
  | "unknown";

type AvailabilityResponse = {
  available?: boolean;
  message?: string;
};

type UsernameCheck = {
  name: string;
  state: CheckState;
  message: string;
};

const VALID_USERNAME = /^[a-z][a-z0-9_]{2,29}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "billing",
  "callback",
  "contact",
  "dashboard",
  "dipolabs",
  "dipo_labs",
  "explore",
  "features",
  "forgot-password",
  "heybio",
  "help",
  "hypedrop",
  "login",
  "logout",
  "me",
  "news",
  "onboarding",
  "official",
  "pricing",
  "privacy",
  "register",
  "reset-password",
  "root",
  "security",
  "settings",
  "signup",
  "staff",
  "support",
  "system",
  "templates",
  "terms",
  "verify-email",
  "www",
  "our-story",
  "about-heybio",
  "about-dipolabs",
  "whats-new",
  "report-problem",
  "getting-started",
  "faqs",
  "cookie-policy",
  "refund-policy",
  "cookies",
  "community-guidelines",
  "analytics",
  "legal",
]);

export default function UsernameClaim() {
  const inputId = useId();
  const feedbackId = useId();

  const [username, setUsername] = useState("");
  const [check, setCheck] = useState<UsernameCheck | null>(
    null,
  );

  const name = username.trim().toLowerCase();

  const valid =
    VALID_USERNAME.test(name) && !RESERVED.has(name);

  const current = check?.name === name ? check : null;
  const isTaken = current?.state === "taken";

  // This is a preview check, not final username ownership.
  const canContinue = valid && !isTaken;

  useEffect(() => {
    if (!valid) return;

    const controller = new AbortController();
    let active = true;

    setCheck({
      name,
      state: "checking",
      message: "Checking this username…",
    });

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/username-availability?username=${encodeURIComponent(name)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Preview check unavailable");
        }

        const result =
          (await response.json()) as AvailabilityResponse;

        if (!active) return;

        setCheck({
          name,
          state:
            result.available === true ? "available" : "taken",
          message:
            typeof result.message === "string"
              ? result.message
              : result.available === true
                ? "Looks available! You can continue."
                : "That username is already taken. Try another.",
        });
      } catch (error) {
        if (
          !active ||
          (error instanceof Error &&
            error.name === "AbortError")
        ) {
          return;
        }

        setCheck({
          name,
          state: "unknown",
          message:
            "Availability couldn't be checked yet. You can continue; we'll confirm it during setup.",
        });
      }
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [name, valid]);

  function claim(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canContinue) return;

    openHeybioIntro(name);
  }

  let message = "Choose a username to start your page.";

  if (name && !valid) {
    message =
      "Use 3–30 characters, start with a letter, and use only letters, numbers or underscores.";
  } else if (valid) {
    message = current?.message ?? "Checking this username…";
  }

  return (
    <form
      className="hx-claim"
      onSubmit={claim}
      noValidate
    >
      <label
        className="hx-claim__label"
        htmlFor={inputId}
      >
        Claim your own corner of the internet
      </label>

      <div className="hx-claim__row">
        <div className="hx-claim__input-wrap">
          <span
            className="hx-claim__prefix"
            aria-hidden="true"
          >
            heybio.in/
          </span>

          <input
            id={inputId}
            type="text"
            name="username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "")
                  .slice(0, 30),
              )
            }
            placeholder="yourname"
            minLength={3}
            maxLength={30}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            aria-invalid={
              name.length > 0 && (!valid || isTaken)
            }
            aria-describedby={feedbackId}
          />

          {current?.state === "checking" ? (
            <LoaderCircle
              size={18}
              className="hx-claim__spin"
              aria-label="Checking username"
            />
          ) : current?.state === "available" ? (
            <Check
              size={18}
              className="hx-claim__tick"
              aria-label="Username appears available"
            />
          ) : null}
        </div>

        <button
          className="hx-claim__button"
          type="submit"
          disabled={!canContinue}
        >
          Claim my HEYBIO
          <ArrowUpRight
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>

      <p
        id={feedbackId}
        role="status"
        aria-live="polite"
        className={`hx-claim__feedback ${
          current?.state === "available"
            ? "hx-claim__feedback--ok"
            : ""
        }`}
      >
        {message}
      </p>
    </form>
  );
}
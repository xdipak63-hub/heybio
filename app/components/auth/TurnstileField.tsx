
import {
  useEffect,
  useRef,
  useState,
} from "react";

type TurnstileAPI = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "light";
      size: "flexible";
      responseField: false;
      callback: (
        token: string,
      ) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string;

  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

let loading:
  | Promise<void>
  | undefined;

function ensureTurnstile(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (loading) return loading;

  loading = new Promise<void>(
    (resolve, reject) => {
      const tag =
        document.createElement("script");

      tag.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

      tag.async = true;

      tag.onload = () =>
        window.turnstile
          ? resolve()
          : reject(
              new Error(
                "Turnstile not ready",
              ),
            );

      tag.onerror = () =>
        reject(
          new Error(
            "Turnstile script blocked",
          ),
        );

    document.head.appendChild(tag);
    },
  ).catch((error: unknown) => {
    loading = undefined;
    throw error;
  });

  return loading;
}

export default function TurnstileField({
  siteKey,
  retryKey,
  onVerifiedChange,
}: {
  siteKey: string;
  retryKey?: number;
  onVerifiedChange: (
    verified: boolean,
  ) => void;
}) {
  const element =
    useRef<HTMLDivElement>(null);

  const onChange =
    useRef(onVerifiedChange);

  onChange.current = onVerifiedChange;

  const [token, setToken] =
    useState("");

  const [status, setStatus] =
    useState<
      | "loading"
      | "waiting"
      | "verified"
      | "error"
    >("loading");

  const [retry, setRetry] =
    useState(0);

  useEffect(() => {
    let mounted = true;
    let id: string | null = null;

    setToken("");
    setStatus("loading");
    onChange.current(false);

    ensureTurnstile()
      .then(() => {
        if (
          !mounted ||
          !element.current ||
          !window.turnstile
        ) {
          return;
        }

        element.current.replaceChildren();

        try {
          id = window.turnstile.render(
            element.current,
            {
              sitekey: siteKey,
              theme: "light",
              size: "flexible",
              responseField: false,

              callback: (nextToken) => {
                if (!mounted) return;

                setToken(nextToken);
                setStatus("verified");

                onChange.current(true);
              },

              "expired-callback": () => {
                if (!mounted) return;

                setToken("");
                setStatus("error");

                onChange.current(false);
              },

              "error-callback": () => {
                if (!mounted) return;

                setToken("");
                setStatus("error");

                onChange.current(false);
              },

              "timeout-callback": () => {
                if (!mounted) return;

                setToken("");
                setStatus("error");

                onChange.current(false);
              },
            },
          );

          setStatus((prev) =>
            prev === "verified"
              ? prev
              : "waiting",
          );
        } catch {
          setStatus("error");
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus("error");
        }
      });

    return () => {
      mounted = false;

      if (
        id &&
        window.turnstile
      ) {
        try {
          window.turnstile.remove(id);
        } catch {
          // Widget was already removed.
        }
      }
    };
  }, [siteKey, retryKey, retry]);

  return (
    <div className="hb-a__turnstile">
      <div className="hb-a__turnstile-line">
        <strong>
          Security check
        </strong>

        <span aria-live="polite">
          {status === "verified"
            ? "Verified ✓"
            : status === "loading"
              ? "Loading…"
              : status === "error"
                ? "Connection issue"
                : "Complete to continue"}
        </span>
      </div>

      <div
        className="hb-a__turnstile-widget"
        ref={element}
      />

      <input
        type="hidden"
        name="cf-turnstile-response"
        value={token}
      />

      {status === "error" && (
        <div
          className="hb-a__turnstile-error"
          role="status"
        >
          Can't load verification.
          Check your connection or
          widget hostname.

          <button
            type="button"
            onClick={() =>
              setRetry(
                (n) => n + 1,
              )
            }
          >
            Retry check
          </button>
        </div>
      )}
    </div>
  );
}

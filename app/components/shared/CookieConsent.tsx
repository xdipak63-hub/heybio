
import {
  useEffect,
  useState,
} from "react";

import {
  Cookie,
  Settings2,
  X,
} from "lucide-react";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "heybio_cookie_preferences_v1";

function isPreferences(
  value: unknown,
): value is CookiePreferences {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    data.necessary === true &&
    typeof data.analytics === "boolean" &&
    typeof data.marketing === "boolean" &&
    typeof data.updatedAt === "string"
  );
}

export function readCookiePreferences():
  | CookiePreferences
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
      STORAGE_KEY,
    );

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    return isPreferences(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export type CookieConsentProps = {
  onChange?: (preferences: CookiePreferences) => void;
  privacyUrl?: string;
};

export function CookieConsent({
  onChange,
  privacyUrl,
}: CookieConsentProps) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = readCookiePreferences();

    if (saved) {
      setAnalytics(saved.analytics);
      setMarketing(saved.marketing);
    } else {
      setVisible(true);
    }

    setReady(true);
  }, []);

  function save(
    nextAnalytics: boolean,
    nextMarketing: boolean,
  ) {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Storage can be blocked in private browsing.
    }

    onChange?.(preferences);

    window.dispatchEvent(
      new CustomEvent("heybio:consent", {
        detail: preferences,
      }),
    );

    setVisible(false);
    setCustomize(false);
  }

  if (!ready || !visible) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      style={{
        position: "fixed",
        zIndex: 1000,
        bottom: 18,
        left: 18,
        right: 18,
        maxWidth: 480,
        marginLeft: "auto",
        padding: 24,
        borderRadius: 22,
        background: "#171817",
        color: "#FFFFFF",
        boxShadow: "0 20px 60px #00000040",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Cookie
          size={26}
          color="#BDF806"
          aria-hidden="true"
        />

        <button
          type="button"
          aria-label="Dismiss cookie notice"
          onClick={() => setVisible(false)}
          style={{
            border: 0,
            background: "transparent",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <h2
        style={{
          margin: "16px 0 8px",
          fontSize: 22,
        }}
      >
        Your privacy matters.
      </h2>

      <p
        style={{
          margin: "0 0 18px",
          fontSize: 13,
          lineHeight: 1.7,
          color: "#CDD0C9",
        }}
      >
        Essential storage supports the site.
        You can choose whether to allow
        optional analytics and marketing storage.
      </p>

      {privacyUrl && (
        <a
          href={privacyUrl}
          style={{
            color: "#BDF806",
            fontSize: 12,
            textDecoration: "underline",
          }}
        >
          Read privacy policy
        </a>
      )}

      {customize && (
        <div
          style={{
            display: "grid",
            gap: 16,
            margin: "20px 0",
          }}
        >
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
            }}
          >
            Necessary storage
            <input
              type="checkbox"
              checked
              disabled
            />
          </label>

          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
            }}
          >
            Analytics
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) =>
                setAnalytics(event.target.checked)
              }
            />
          </label>

          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
            }}
          >
            Marketing
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) =>
                setMarketing(event.target.checked)
              }
            />
          </label>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={() => save(false, false)}
          style={{
            padding: "11px 15px",
            borderRadius: 100,
            border: "1px solid #646760",
            background: "transparent",
            color: "#FFFFFF",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reject optional
        </button>

        <button
          type="button"
          onClick={() => {
            if (customize) {
              save(analytics, marketing);
            } else {
              setCustomize(true);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "11px 15px",
            borderRadius: 100,
            border: "1px solid #646760",
            background: "transparent",
            color: "#FFFFFF",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Settings2 size={15} />
          {customize ? "Save choices" : "Customize"}
        </button>

        <button
          type="button"
          onClick={() => save(true, true)}
          style={{
            padding: "11px 17px",
            borderRadius: 100,
            border: 0,
            background: "#BDF806",
            color: "#171817",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Accept all
        </button>
      </div>
    </aside>
  );
}

export default CookieConsent;

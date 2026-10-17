
import type { ReactNode } from "react";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

import Logo from "./components/shared/Logo";

import {
  ToastProvider,
} from "./components/ui/Toast";

import {
  CookieConsent,
} from "./components/shared/CookieConsent";

import "./styles/tokens.css";
import "./styles/ui-system.css";
import "./styles/creator-components.css";
import "./styles/themes.css";
import "./styles/animations.css";
import "./styles/admin-operations.css";

import "./styles/app.css";
import "./styles/heybio-premium.css";
import "./styles/marketing-fixes.css";

export function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta
          name="theme-color"
          content="#FFFFFF"
        />

        <meta
          name="color-scheme"
          content="light"
        />

        <meta
          name="referrer"
          content="strict-origin-when-cross-origin"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />

        <meta
          name="apple-mobile-web-app-title"
          content="HEYBIO"
        />

        <meta
          name="application-name"
          content="HEYBIO"
        />

        <link
          rel="icon"
          href="/favicon.ico"
          sizes="any"
        />

        <link
          rel="icon"
          href="/icon.svg"
          type="image/svg+xml"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link
          rel="manifest"
          href="/manifest.webmanifest"
        />

        <Meta />
        <Links />
      </head>

      <body>
        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Outlet />

      <CookieConsent privacyUrl="/privacy" />
    </ToastProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const status =
    isRouteErrorResponse(error)
      ? error.status
      : 500;

  const isNotFound = status === 404;

  return (
    <main className="error-page">
      <Logo size="sm" />

      <div className="error-page__content">
        <span className="eyebrow">
          HEYBIO / {status}
        </span>

        <h1>
          {isNotFound
            ? "Page not found."
            : "Something went wrong."}
        </h1>

        <p>
          {isNotFound
            ? "The page you're looking for doesn't exist."
            : "Please try again in a moment."}
        </p>

        <a
          href="/"
          className="button button--dark"
        >
          Back to homepage ↗
        </a>
      </div>

      <p className="error-page__footer">
        © 2026 DIPO LABS
      </p>
    </main>
  );
}
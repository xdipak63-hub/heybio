
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

import "./styles/app.css";
import "./styles/heybio-premium.css";
import "./styles/marketing-fixes.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="color-scheme" content="light" />
        <meta
          name="referrer"
          content="strict-origin-when-cross-origin"
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
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <main className="error-page">
      <a href="/" className="brand">
        HEYBIO <span className="brand-arrow">↗</span>
      </a>
      <div className="error-page__content">
        <span className="eyebrow">HEYBIO / {status}</span>
        <h1>
          {status === 404
            ? "Page not found."
            : "Something went wrong."}
        </h1>
        <p>
          {status === 404
            ? "The page you're looking for doesn't exist."
            : "Please try again in a moment."}
        </p>
        <a href="/" className="button button--dark">
          Back to homepage ↗
        </a>
      </div>
      <p className="error-page__footer">
        © 2026 DIPO LABS
      </p>
    </main>
  );
}

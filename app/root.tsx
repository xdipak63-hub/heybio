
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError
} from "react-router";

import "./styles/app.css";

export function Layout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#f9f9f6" />
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

  const status = isRouteErrorResponse(error)
    ? error.status
    : 500;

  const title =
    status === 404
      ? "Page not found."
      : "Something went wrong.";

  const message =
    status === 404
      ? "The page you're looking for doesn't exist."
      : "We couldn't complete your request. Please try again.";

  return (
    <main className="error-page">
      <a href="/" className="brand" aria-label="HEYBIO home">
        HEYBIO<span className="brand-arrow">↗</span>
      </a>

      <div className="error-page__content">
        <span className="eyebrow">HEYBIO / {status}</span>
        <h1>{title}</h1>
        <p>{message}</p>

        <a href="/" className="button button--dark">
          Back to homepage
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <p className="error-page__footer">
        © 2026 DIPO LABS
      </p>
    </main>
  );
}
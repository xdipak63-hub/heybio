
import { Link } from "react-router";
import { ArrowLeft, Compass, Home } from "lucide-react";

type Props = {
  unavailable?: boolean;
};

export default function ProfileNotFound({
  unavailable = false
}: Props) {
  return (
    <main className="hb-public-missing">
      <header className="hb-public-missing__header">
        <Link to="/" aria-label="HEYBIO homepage">
          HEYBIO <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="hb-public-missing__body">
        <div className="hb-public-missing__icon">
          <Compass size={29} strokeWidth={1.6} aria-hidden="true" />
        </div>

        <span className="hb-public-missing__eyebrow">
          {unavailable ? "TEMPORARILY UNAVAILABLE" : "404 / PROFILE NOT FOUND"}
        </span>

        <h1>
          {unavailable
            ? "This page needs a moment."
            : "This world isn't here yet."}
        </h1>

        <p>
          {unavailable
            ? "We couldn't load this creator's page right now. Please try again shortly."
            : "The creator page may have moved, become unavailable, or the link might contain a typo."}
        </p>

        <div className="hb-public-missing__actions">
          <Link to="/" className="hb-public-missing__primary">
            <Home size={17} aria-hidden="true" />
            HEYBIO home
          </Link>

          <button
            type="button"
            className="hb-public-missing__secondary"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Go back
          </button>
        </div>
      </section>

      <footer className="hb-public-missing__footer">
        © 2026 DIPO LABS · Your world. One link.
      </footer>
    </main>
  );
}

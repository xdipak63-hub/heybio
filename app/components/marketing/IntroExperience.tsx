
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe2,
  Instagram,
  Link2,
  Music2,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export const HEYBIO_INTRO_EVENT = "heybio:open-intro";

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;
const SESSION_KEY = "heybio:desired-username";

export function openHeybioIntro(username: string): void {
  if (typeof window === "undefined") return;

  const normalized = username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) return;

  window.dispatchEvent(
    new CustomEvent(HEYBIO_INTRO_EVENT, {
      detail: { username: normalized },
    }),
  );
}

type IntroSlide = {
  eyebrow: string;
  firstLine: string;
  secondLine: string;
  description: string;
  takeaway: string;
};

const SLIDES: readonly IntroSlide[] = [
  {
    eyebrow: "01 / BRING IT TOGETHER",
    firstLine: "Everything you share.",
    secondLine: "One beautiful place.",
    description:
      "Your videos, music, social profiles, store and projects finally have a place to belong.",
    takeaway: "One page, instead of a dozen scattered links.",
  },
  {
    eyebrow: "02 / MAKE IT YOURS",
    firstLine: "Your name.",
    secondLine: "Your kind of space.",
    description:
      "Give your page a personality with your photo, bio, links and a style that feels like you.",
    takeaway: "Start simple. Make it unmistakably yours.",
  },
  {
    eyebrow: "03 / SHARE YOUR WORLD",
    firstLine: "One little link.",
    secondLine: "So much possibility.",
    description:
      "Add your HEYBIO link wherever people discover you. Keep your world easy to find.",
    takeaway: "Your first step is creating your account.",
  },
];

function saveDesiredUsername(username: string): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, username);
  } catch {
    // Signup URL also preserves the requested username.
  }
}

function ArtCard({
  step,
  username,
}: {
  step: number;
  username: string;
}) {
  return (
    <div
      className={`hb-journey__stack hb-journey__stack--${step}`}
      aria-hidden="true"
    >
      <div className="hb-journey__orbit hb-journey__orbit--one" />
      <div className="hb-journey__orbit hb-journey__orbit--two" />

      <div className="hb-journey__card hb-journey__card--four">
        <span>YOUR WORLD</span>
        <Sparkles size={19} />
      </div>

      <div className="hb-journey__card hb-journey__card--three">
        <span>CREATE</span>
        <Palette size={20} />
      </div>

      <div className="hb-journey__card hb-journey__card--two">
        <span>CONNECT</span>
        <Globe2 size={20} />
      </div>

      <div
        className="hb-journey__card hb-journey__card--front"
        key={step}
      >
        <div className="hb-journey__card-top">
          <span className="hb-journey__card-brand">
            HEYBIO <ArrowUpRight size={15} />
          </span>
          <span className="hb-journey__card-index">
            0{step + 1} / 03
          </span>
        </div>

        {step === 0 && (
          <div className="hb-journey__demo hb-journey__demo--links">
            <span className="hb-journey__demo-tag">
              YOUR DIGITAL HOME
            </span>
            <h3>
              All your links.
              <br />
              Just one page.
            </h3>

            <div className="hb-journey__mini-links">
              <div>
                <Instagram size={18} />
                <span>Instagram</span>
                <ArrowUpRight size={17} />
              </div>
              <div>
                <Play size={18} />
                <span>Latest video</span>
                <ArrowUpRight size={17} />
              </div>
              <div>
                <Music2 size={18} />
                <span>My music</span>
                <ArrowUpRight size={17} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="hb-journey__demo hb-journey__demo--identity">
            <div className="hb-journey__profile-mark">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="hb-journey__demo-tag">
              A PAGE THAT FEELS LIKE YOU
            </span>
            <h3>@{username}</h3>
            <p>Creator · Explorer · Original</p>

            <div className="hb-journey__identity-links">
              <span>
                My latest work <ArrowUpRight size={15} />
              </span>
              <span>
                Let's connect <ArrowUpRight size={15} />
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="hb-journey__demo hb-journey__demo--share">
            <div className="hb-journey__share-icon">
              <Link2 size={29} />
            </div>
            <span className="hb-journey__demo-tag">
              ONE LINK. EVERYWHERE.
            </span>
            <h3>
              Ready to
              <br />
              be discovered.
            </h3>

            <div className="hb-journey__address">
              <span>heybio.in/{username}</span>
              <Check size={17} />
            </div>
          </div>
        )}

        <div className="hb-journey__card-bottom">
          <span>YOUR WORLD. ONE LINK.</span>
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="hb-journey__float-note hb-journey__float-note--one">
        <Check size={15} /> Your space
      </div>
      <div className="hb-journey__float-note hb-journey__float-note--two">
        Made for you <Sparkles size={15} />
      </div>
    </div>
  );
}

export default function IntroExperience() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (
        event as CustomEvent<{ username?: string }>
      ).detail;

      const requested =
        detail?.username?.trim().toLowerCase() ?? "";

      if (!USERNAME_PATTERN.test(requested)) return;

      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      saveDesiredUsername(requested);
      setUsername(requested);
      setStep(0);
      setIsOpen(true);
    }

    window.addEventListener(HEYBIO_INTRO_EVENT, handleOpen);

    return () =>
      window.removeEventListener(HEYBIO_INTRO_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const nodes =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex="0"]',
        );

      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  function finish() {
    saveDesiredUsername(username);
    setIsOpen(false);

    navigate(
      `/signup?username=${encodeURIComponent(username)}`,
    );
  }

  const slide = SLIDES[step];

  if (
    !isOpen ||
    !slide ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div className="hb-journey" role="presentation">
      <div
        className="hb-journey__dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hb-journey-heading"
        aria-describedby="hb-journey-description"
      >
        <div className="hb-journey__canvas">
          <header className="hb-journey__header">
            <div
              className="hb-journey__logo"
              aria-label="HEYBIO by DIPO LABS"
            >
              HEYBIO
              <ArrowUpRight size={24} aria-hidden="true" />
            </div>

            <div className="hb-journey__header-right">
              <span className="hb-journey__header-tag">
                YOUR WORLD. ONE LINK.
              </span>

              <button
                type="button"
                className="hb-journey__text-button"
                onClick={finish}
              >
                Skip intro
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                ref={closeRef}
                className="hb-journey__close"
                aria-label="Close intro and return to homepage"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </header>

          <main className="hb-journey__body">
            <div
              className="hb-journey__copy"
              key={`copy-${step}`}
            >
              <div className="hb-journey__eyebrow">
                <span />
                {slide.eyebrow}
              </div>

              <h2 id="hb-journey-heading">
                {slide.firstLine}
                <br />
                <span>{slide.secondLine}</span>
              </h2>

              <p id="hb-journey-description">
                {slide.description}
              </p>

              <div className="hb-journey__takeaway">
                <ShieldCheck size={20} aria-hidden="true" />
                {slide.takeaway}
              </div>

              <div className="hb-journey__username">
                <span>YOUR HEYBIO</span>
                <strong>heybio.in/{username}</strong>
              </div>
            </div>

            <div className="hb-journey__illustration">
              <ArtCard step={step} username={username} />
              <span className="hb-journey__visual-label">
                A PREVIEW OF WHAT YOU CAN CREATE
              </span>
            </div>
          </main>

          <footer className="hb-journey__footer">
            <div
              className="hb-journey__steps"
              aria-label="Intro steps"
            >
              {SLIDES.map((item, index) => (
                <button
                  type="button"
                  key={item.eyebrow}
                  className={`hb-journey__step ${
                    step === index
                      ? "hb-journey__step--active"
                      : ""
                  }`}
                  aria-label={`Show step ${index + 1} of ${SLIDES.length}`}
                  aria-current={
                    step === index ? "step" : undefined
                  }
                  onClick={() => setStep(index)}
                >
                  <span />
                </button>
              ))}

              <span className="hb-journey__steps-count">
                0{step + 1} — 03
              </span>
            </div>

            <div className="hb-journey__actions">
              <button
                type="button"
                className="hb-journey__back"
                disabled={step === 0}
                aria-label="Previous intro step"
                onClick={() =>
                  setStep((current) =>
                    Math.max(0, current - 1),
                  )
                }
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="hb-journey__next"
                onClick={() =>
                  step === SLIDES.length - 1
                    ? finish()
                    : setStep((current) =>
                        Math.min(
                          SLIDES.length - 1,
                          current + 1,
                        ),
                      )
                }
              >
                {step === SLIDES.length - 1
                  ? "Create my HEYBIO"
                  : "Continue"}

                <ArrowRight size={19} aria-hidden="true" />
              </button>
            </div>
          </footer>

          <span className="hb-journey__fineprint">
            HEYBIO is a product of DIPO LABS.
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
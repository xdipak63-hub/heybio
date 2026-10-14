
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe2,
  Link2,
  Palette,
  Sparkles,
  X,
} from "lucide-react";

export const HEYBIO_INTRO_EVENT = "heybio:open-intro";

export function openHeybioIntro(username: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(HEYBIO_INTRO_EVENT, {
      detail: { username },
    }),
  );
}

type Slide = {
  eyebrow: string;
  title: string;
  accentText: string;
  description: string;
  note: string;
  Icon: typeof Link2;
};

const slides: readonly Slide[] = [
  {
    eyebrow: "WELCOME TO YOUR WORLD",
    title: "One place.",
    accentText: "All of you.",
    description:
      "Your links, stories and creativity deserve a beautiful home.",
    note: "Your corner of the internet starts here.",
    Icon: Link2,
  },
  {
    eyebrow: "MAKE IT YOURS",
    title: "Your style.",
    accentText: "Your rules.",
    description:
      "Create a digital space that looks and feels exactly like you.",
    note: "Beautifully personal. Effortlessly yours.",
    Icon: Palette,
  },
  {
    eyebrow: "READY FOR THE WORLD",
    title: "One link.",
    accentText: "Every possibility.",
    description:
      "Bring everything together and share your world with anyone.",
    note: "Your next chapter starts right here.",
    Icon: Globe2,
  },
];

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;

export default function IntroExperience() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [direction, setDirection] = useState<"next" | "back">(
    "next",
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleOpen(event: Event): void {
      const customEvent = event as CustomEvent<{
        username?: string;
      }>;

      const requestedUsername =
        customEvent.detail?.username?.trim().toLowerCase() ?? "";

      if (!USERNAME_PATTERN.test(requestedUsername)) return;

      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      setUsername(requestedUsername);
      setStep(0);
      setDirection("next");
      setOpen(true);
    }

    window.addEventListener(HEYBIO_INTRO_EVENT, handleOpen);

    return () => {
      window.removeEventListener(HEYBIO_INTRO_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const container = document.querySelector<HTMLElement>(
        ".hey-intro",
      );

      if (!container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]',
        ),
      );

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // Strict TypeScript: both elements must exist.
      if (!first || !last) return;

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  function finish(): void {
    setOpen(false);

    try {
      sessionStorage.setItem(
        "heybio:desired-username",
        username,
      );
    } catch {
      // Username is also passed through the signup URL.
    }

    navigate(
      `/signup?username=${encodeURIComponent(username)}`,
    );
  }

  function next(): void {
    if (step >= slides.length - 1) {
      finish();
      return;
    }

    setDirection("next");
    setStep((current) =>
      Math.min(current + 1, slides.length - 1),
    );
  }

  function back(): void {
    setDirection("back");
    setStep((current) => Math.max(current - 1, 0));
  }

  // Safe array access for noUncheckedIndexedAccess.
  const slide = slides[step];

  if (!open || !slide) return null;

  const Icon = slide.Icon;

  return (
    <div
      className="hey-intro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hey-intro-title"
    >
      <div className="hey-intro__shell">
        <header className="hey-intro__header">
          <div className="hey-intro__brand">
            HEYBIO
            <ArrowUpRight aria-hidden="true" />
          </div>

          <button
            ref={closeButtonRef}
            className="hey-intro__skip"
            type="button"
            onClick={finish}
          >
            Skip intro
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div
          className="hey-intro__main"
          key={`${step}-${direction}`}
        >
          <div className="hey-intro__copy">
            <div className="hey-intro__eyebrow">
              <Sparkles size={18} aria-hidden="true" />
              {slide.eyebrow}
            </div>

            <h2
              id="hey-intro-title"
              className="hey-intro__title"
            >
              {slide.title}
              <span>{slide.accentText}</span>
            </h2>

            <p className="hey-intro__description">
              {slide.description}
            </p>

            <p className="hey-intro__note">
              <Check size={19} aria-hidden="true" />
              {slide.note}
            </p>
          </div>

          <div
            className="hey-intro__visual"
            aria-hidden="true"
          >
            <div className="hey-intro__art">
              <div className="hey-intro__art-inner">
                <Icon strokeWidth={1.6} />
              </div>

              <div className="hey-intro__sticker hey-intro__sticker--top">
                <Sparkles size={15} />
                MAKE IT YOURS
              </div>

              <div className="hey-intro__sticker hey-intro__sticker--bottom">
                YOUR SPACE. YOUR RULES.
                <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
        </div>

        <footer className="hey-intro__footer">
          <div className="hey-intro__progress">
            <div
              className="hey-intro__dots"
              aria-label={`Step ${step + 1} of ${slides.length}`}
            >
              {slides.map((item, index) => (
                <button
                  key={item.eyebrow}
                  type="button"
                  className={
                    index === step
                      ? "hey-intro__dot hey-intro__dot--active"
                      : "hey-intro__dot"
                  }
                  onClick={() => {
                    setDirection(
                      index > step ? "next" : "back",
                    );
                    setStep(index);
                  }}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={
                    index === step ? "step" : undefined
                  }
                />
              ))}
            </div>

            <span>
              {String(step + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          <div className="hey-intro__actions">
            <button
              type="button"
              className="hey-intro__back"
              onClick={back}
              disabled={step === 0}
              aria-label="Previous slide"
            >
              <ArrowLeft size={22} />
            </button>

            <button
              type="button"
              className="hey-intro__next"
              onClick={next}
            >
              {step === slides.length - 1
                ? "Create my HEYBIO"
                : "Continue"}

              <ArrowRight size={21} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

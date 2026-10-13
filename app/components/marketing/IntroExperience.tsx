
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe2,
  Link2,
  MousePointer2,
  Palette,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

type IntroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  note: string;
  accent: string;
  icon: "link" | "palette" | "globe";
};

const SLIDES: readonly [
  IntroSlide,
  IntroSlide,
  IntroSlide,
] = [
  {
    id: "welcome",
    eyebrow: "WELCOME TO YOUR WORLD",
    title: "One place.",
    highlight: "All of you.",
    description:
      "Your links, stories and creativity deserve a beautiful home.",
    note: "A little corner of the internet, made for you.",
    accent: "#BDF806",
    icon: "link",
  },
  {
    id: "create",
    eyebrow: "MAKE IT YOURS",
    title: "Your style.",
    highlight: "Your rules.",
    description:
      "Create a digital space that looks and feels exactly like you.",
    note: "Big personality. One beautiful link.",
    accent: "#C8E9FF",
    icon: "palette",
  },
  {
    id: "share",
    eyebrow: "READY FOR THE WORLD?",
    title: "One link.",
    highlight: "Endless possibilities.",
    description:
      "Bring everything together and share your world with anyone.",
    note: "Your next chapter starts right here.",
    accent: "#E6D3FF",
    icon: "globe",
  },
];

const STORAGE_KEY = "heybio:intro:completed:v1";

function readIntroCompleted(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveIntroCompleted(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

function SlideIcon({
  type,
  size = 42,
}: {
  type: IntroSlide["icon"];
  size?: number;
}) {
  if (type === "palette") {
    return <Palette size={size} strokeWidth={1.6} />;
  }

  if (type === "globe") {
    return <Globe2 size={size} strokeWidth={1.6} />;
  }

  return <Link2 size={size} strokeWidth={1.6} />;
}

export default function IntroExperience() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const slide = SLIDES[index] ?? SLIDES[0];
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    setVisible(!readIntroCompleted());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  function finishIntro() {
    saveIntroCompleted();
    setVisible(false);
  }

  function changeSlide(nextIndex: number) {
    if (animating) return;
    if (nextIndex < 0 || nextIndex >= SLIDES.length) return;
    if (nextIndex === index) return;

    setAnimating(true);
    setIndex(nextIndex);
  }

  function nextSlide() {
    if (animating) return;

    if (isLast) {
      finishIntro();
      return;
    }

    changeSlide(index + 1);
  }

  function previousSlide() {
    changeSlide(index - 1);
  }

  if (!ready || !visible) {
    return null;
  }

  return (
    <div
      className="hb-intro"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to HEYBIO"
      style={
        {
          "--intro-accent": slide.accent,
        } as React.CSSProperties
      }
    >
      <style>{`
        .hb-intro,
        .hb-intro * {
          box-sizing: border-box;
        }

        .hb-intro {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100%;
          height: 100dvh;
          min-height: 100svh;
          overflow-x: hidden;
          overflow-y: auto;
          background: #101110;
          color: #f9faf5;
          font-family: inherit;
          isolation: isolate;
          -webkit-font-smoothing: antialiased;
        }

        .hb-intro::before {
          content: "";
          position: fixed;
          width: min(95vw, 800px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--intro-accent);
          filter: blur(150px);
          opacity: .12;
          right: -28%;
          bottom: -40%;
          pointer-events: none;
          transition: background .6s ease;
        }

        .hb-intro-shell {
          position: relative;
          z-index: 1;
          width: min(100%, 1440px);
          min-height: 100dvh;
          margin: 0 auto;
          padding: clamp(22px, 4vw, 54px);
          display: flex;
          flex-direction: column;
        }

        .hb-intro-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .hb-intro-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-weight: 900;
          letter-spacing: -.075em;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1;
        }

        .hb-intro-brand svg {
          color: var(--intro-accent);
        }

        .hb-intro-skip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #343734;
          background: #202220;
          color: #fff;
          border-radius: 999px;
          padding: 12px 17px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background .2s ease;
        }

        .hb-intro-skip:hover {
          background: #303330;
        }

        .hb-intro-content {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: center;
          gap: clamp(24px, 5vw, 90px);
          padding-block: 50px;
        }

        .hb-intro-copy {
          max-width: 680px;
          animation: hb-intro-enter .55s ease both;
        }

        .hb-intro-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--intro-accent);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .hb-intro-eyebrow::before {
          content: "";
          display: block;
          width: 24px;
          height: 2px;
          background: currentColor;
        }

        .hb-intro-title {
          margin: 22px 0 24px;
          font-size: clamp(54px, 7.5vw, 116px);
          line-height: .98;
          font-weight: 900;
          letter-spacing: -.085em;
        }

        .hb-intro-title span {
          display: block;
          color: var(--intro-accent);
        }

        .hb-intro-description {
          margin: 0;
          max-width: 550px;
          color: #c1c5bd;
          font-size: clamp(17px, 2vw, 24px);
          line-height: 1.55;
          letter-spacing: -.025em;
        }

        .hb-intro-note {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e5e7df;
          font-size: 14px;
          font-weight: 600;
        }

        .hb-intro-note svg {
          flex-shrink: 0;
          color: var(--intro-accent);
        }

        .hb-intro-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          animation: hb-intro-enter .65s .08s ease both;
        }

        .hb-intro-art {
          position: relative;
          display: grid;
          place-items: center;
          width: min(100%, 460px);
          aspect-ratio: 1;
          border: 1px solid #363a33;
          border-radius: 38px;
          background:
            radial-gradient(
              circle at 65% 25%,
              color-mix(in srgb, var(--intro-accent) 18%, transparent),
              transparent 60%
            ),
            #191c19;
          box-shadow: 0 30px 100px #0005;
          transform: rotate(-4deg);
        }

        .hb-intro-art::after {
          content: "";
          position: absolute;
          inset: 15px;
          border: 1px solid #ffffff10;
          border-radius: 28px;
          pointer-events: none;
        }

        .hb-intro-art-icon {
          display: grid;
          place-items: center;
          width: 36%;
          aspect-ratio: 1;
          border-radius: 32%;
          background: var(--intro-accent);
          color: #141614;
          box-shadow: 0 22px 70px #0004;
          transform: rotate(4deg);
          animation: hb-intro-float 5s ease-in-out infinite;
        }

        .hb-intro-art-icon svg {
          width: 55%;
          height: 55%;
        }

        .hb-intro-sticker {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 100px;
          padding: 12px 17px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .02em;
          white-space: nowrap;
          box-shadow: 0 12px 35px #0003;
        }

        .hb-intro-sticker-one {
          top: 13%;
          right: -5%;
          background: #fff;
          color: #161816;
          transform: rotate(10deg);
        }

        .hb-intro-sticker-two {
          bottom: 14%;
          left: -6%;
          background: var(--intro-accent);
          color: #161816;
          transform: rotate(-8deg);
        }

        .hb-intro-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }

        .hb-intro-progress {
          display: flex;
          gap: 7px;
          margin-bottom: 14px;
        }

        .hb-intro-progress button {
          width: 30px;
          height: 5px;
          border: 0;
          border-radius: 99px;
          padding: 0;
          background: #484c45;
          cursor: pointer;
          transition: background .25s, width .25s;
        }

        .hb-intro-progress button[aria-current="step"] {
          width: 56px;
          background: var(--intro-accent);
        }

        .hb-intro-count {
          color: #9ca197;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .12em;
        }

        .hb-intro-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hb-intro-back,
        .hb-intro-next {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 54px;
          border: 0;
          border-radius: 999px;
          font: inherit;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .2s, background .2s;
        }

        .hb-intro-back:hover,
        .hb-intro-next:hover {
          transform: translateY(-2px);
        }

        .hb-intro-back {
          width: 54px;
          background: #2a2d29;
          color: #fff;
        }

        .hb-intro-back:disabled {
          opacity: .35;
          cursor: not-allowed;
          transform: none;
        }

        .hb-intro-next {
          min-width: 175px;
          padding: 0 26px;
          background: var(--intro-accent);
          color: #151715;
        }

        @keyframes hb-intro-enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hb-intro-float {
          0%, 100% { transform: translateY(0) rotate(4deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }

        @media (max-width: 800px) {
          .hb-intro-content {
            grid-template-columns: 1fr;
            gap: 35px;
            padding-block: 50px 30px;
          }

          .hb-intro-copy {
            max-width: 100%;
          }

          .hb-intro-title {
            font-size: clamp(54px, 11vw, 84px);
          }

          .hb-intro-visual {
            padding-inline: 15px;
          }

          .hb-intro-art {
            width: min(100%, 300px);
            border-radius: 28px;
          }

          .hb-intro-art::after {
            border-radius: 20px;
          }

          .hb-intro-bottom {
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .hb-intro-shell {
            padding: 24px 22px;
          }

          .hb-intro-brand {
            font-size: 25px;
          }

          .hb-intro-skip {
            padding: 10px 12px;
            font-size: 12px;
          }

          .hb-intro-content {
            padding-block: 45px 25px;
          }

          .hb-intro-title {
            margin: 20px 0;
            font-size: clamp(51px, 12vw, 66px);
          }

          .hb-intro-description {
            font-size: 17px;
          }

          .hb-intro-note {
            margin-top: 22px;
            font-size: 12px;
          }

          .hb-intro-art {
            width: min(100%, 235px);
          }

          .hb-intro-sticker {
            padding: 9px 11px;
            font-size: 10px;
          }

          .hb-intro-bottom {
            gap: 12px;
          }

          .hb-intro-next {
            min-width: 142px;
            padding-inline: 18px;
          }

          .hb-intro-back {
            width: 48px;
            min-height: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-intro *,
          .hb-intro *::before,
          .hb-intro *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="hb-intro-shell">
        <header className="hb-intro-top">
          <div className="hb-intro-brand">
            HEYBIO <ArrowUpRight size={27} strokeWidth={2.5} />
          </div>

          <button
            type="button"
            className="hb-intro-skip"
            onClick={finishIntro}
            aria-label="Skip introduction"
          >
            Skip intro
            <X size={17} />
          </button>
        </header>

        <main className="hb-intro-content">
          <section
            key={`copy-${slide.id}`}
            className="hb-intro-copy"
            aria-live="polite"
          >
            <div className="hb-intro-eyebrow">
              <Sparkles size={16} />
              {slide.eyebrow}
            </div>

            <h1 className="hb-intro-title">
              {slide.title}
              <span>{slide.highlight}</span>
            </h1>

            <p className="hb-intro-description">
              {slide.description}
            </p>

            <div className="hb-intro-note">
              <WandSparkles size={19} />
              <span>{slide.note}</span>
            </div>
          </section>

          <div
            key={`visual-${slide.id}`}
            className="hb-intro-visual"
            aria-hidden="true"
          >
            <div className="hb-intro-art">
              <div className="hb-intro-art-icon">
                <SlideIcon type={slide.icon} />
              </div>

              <div className="hb-intro-sticker hb-intro-sticker-one">
                <MousePointer2 size={15} />
                MAKE IT YOURS
              </div>

              <div className="hb-intro-sticker hb-intro-sticker-two">
                <Check size={15} />
                YOUR SPACE. YOUR RULES.
              </div>
            </div>
          </div>
        </main>

        <footer className="hb-intro-bottom">
          <div>
            <div
              className="hb-intro-progress"
              aria-label="Introduction progress"
            >
              {SLIDES.map((item, slideIndex) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to introduction step ${slideIndex + 1}`}
                  aria-current={
                    slideIndex === index ? "step" : undefined
                  }
                  onClick={() => changeSlide(slideIndex)}
                />
              ))}
            </div>

            <div className="hb-intro-count">
              {String(index + 1).padStart(2, "0")}
              {" / "}
              {String(SLIDES.length).padStart(2, "0")}
            </div>
          </div>

          <div className="hb-intro-actions">
            <button
              type="button"
              className="hb-intro-back"
              onClick={previousSlide}
              disabled={index === 0 || animating}
              aria-label="Previous introduction slide"
            >
              <ArrowLeft size={21} />
            </button>

            <button
              type="button"
              className="hb-intro-next"
              onClick={nextSlide}
              disabled={animating}
            >
              {isLast ? "Get started" : "Continue"}
              <ArrowRight size={20} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
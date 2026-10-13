import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  Check,
  Globe2,
  Heart,
  Link2,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import IntroExperience from "../../components/marketing/IntroExperience";
import UsernameClaim from "../../components/marketing/UsernameClaim";

export function meta() {
  return [
    {
      title: "HEYBIO ↗ — Your world. One link.",
    },
    {
      name: "description",
      content:
        "Create your own corner of the internet. " +
        "Bring your links, content and creativity " +
        "together with HEYBIO by DIPO LABS.",
    },
    {
      property: "og:title",
      content: "HEYBIO — Your world. One link.",
    },
    {
      property: "og:description",
      content:
        "Everything you are. One beautiful link.",
    },
  ];
}

const features = [
  {
    number: "01",
    title: "Every link. One place.",
    description:
      "Bring your content, work and favorite corners of the internet together.",
    Icon: Link2,
    className: "hb-feature--lime",
  },
  {
    number: "02",
    title: "Look like yourself.",
    description:
      "Build a profile that reflects your personality, colors and style.",
    Icon: Palette,
    className: "hb-feature--blue",
  },
  {
    number: "03",
    title: "Understand your reach.",
    description:
      "Discover how people interact with your profile and links.",
    Icon: BarChart3,
    className: "hb-feature--white",
  },
  {
    number: "04",
    title: "Share it everywhere.",
    description:
      "Give people one memorable destination for your digital world.",
    Icon: Globe2,
    className: "hb-feature--dark",
  },
];

const steps = [
  {
    number: "01",
    title: "Claim your space.",
    description:
      "Choose your username and create your account.",
    Icon: Sparkles,
  },
  {
    number: "02",
    title: "Make it yours.",
    description:
      "Add your links and customize your profile.",
    Icon: WandSparkles,
  },
  {
    number: "03",
    title: "Share your world.",
    description:
      "Publish your HEYBIO and share it anywhere.",
    Icon: Zap,
  },
];

function ProfilePreview() {
  return (
    <div
      className="hb-preview-scene"
      aria-label="Example HEYBIO creator profile design"
    >
      <div className="hb-preview-glow" />

      <div className="hb-preview-card">
        <div className="hb-preview-top">
          <span>HEYBIO ↗</span>
          <span>•••</span>
        </div>

        <div className="hb-preview-avatar">
          <Sparkles size={32} strokeWidth={1.7} />
        </div>

        <h3>@yourworld</h3>

        <p>
          A little bit of everything.
          <br />
          All in one beautiful place.
        </p>

        <div className="hb-preview-socials">
          <span>◎</span>
          <span>✦</span>
          <span>◇</span>
        </div>

        <div className="hb-preview-links">
          <div>
            <span className="hb-preview-link-icon">
              <WandSparkles size={19} />
            </span>
            My latest work
            <ArrowUpRight size={19} />
          </div>

          <div>
            <span className="hb-preview-link-icon">
              <Play size={19} fill="currentColor" />
            </span>
            Watch my content
            <ArrowUpRight size={19} />
          </div>

          <div>
            <span className="hb-preview-link-icon">
              <Heart size={19} />
            </span>
            Things I love
            <ArrowUpRight size={19} />
          </div>
        </div>

        <small>
          Made with <strong>HEYBIO ↗</strong>
        </small>
      </div>

      <div className="hb-preview-sticker hb-preview-sticker--top">
        <Sparkles size={17} />
        MAKE IT YOURS
      </div>

      <div className="hb-preview-sticker hb-preview-sticker--bottom">
        <span />
        YOUR SPACE. YOUR RULES.
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <IntroExperience />
      <Navbar />

      <main id="main-content" className="hb-home">
        <section className="hb-hero">
          <div className="hb-hero__glow" />

          <div className="hb-container hb-hero__inner">
            <div className="hb-hero__content">
              <span className="hb-pill">
                <Sparkles size={17} />
                YOUR INTERNET. YOUR WAY.
              </span>

              <h1>
                Your world.
                <br />
                <span>One link.</span>
              </h1>

              <p className="hb-hero__description">
                Your content. Your creativity.
                Your everything. Give your digital
                world one beautiful place to call home.
              </p>

              <div id="claim-username">
                <UsernameClaim />
              </div>

              <a
                href="#how-it-works"
                className="hb-hero__secondary"
              >
                See how it works
                <ArrowDown size={19} />
              </a>

              <div className="hb-hero__note">
                <span />
                Made for creators, dreamers and
                everyone in between.
              </div>
            </div>

            <ProfilePreview />
          </div>

          <div className="hb-hero__scroll">
            SCROLL TO EXPLORE
            <ArrowDown size={18} />
          </div>
        </section>

        <div
          className="hb-marquee"
          aria-label="Share, create and be yourself"
        >
          <div className="hb-marquee__track">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>
                SHARE <Sparkles size={26} />
                BE YOU <Sparkles size={26} />
                CREATE <Sparkles size={26} />
                REPEAT <Sparkles size={26} />
              </span>
            ))}
          </div>
        </div>

        <section className="hb-section hb-story">
          <div className="hb-container">
            <span className="hb-eyebrow">
              HELLO, INTERNET
            </span>

            <h2>
              You are more than
              <br />
              <span>just one thing.</span>
            </h2>

            <p>
              You're a creator, a thinker, a dreamer
              and so much more. HEYBIO brings your
              stories, work, passions and links
              together in one thoughtfully designed space.
            </p>

            <a href="#features" className="hb-text-link">
              Discover what makes HEYBIO different
              <ArrowUpRight size={22} />
            </a>
          </div>
        </section>

        <section
          id="features"
          className="hb-section hb-features"
        >
          <div className="hb-container">
            <span className="hb-eyebrow">
              MADE FOR MORE
            </span>

            <h2>
              Small link.
              <br />
              Big possibilities.
            </h2>

            <p className="hb-section-lead">
              Everything you need to make a
              lasting first impression.
            </p>

            <div className="hb-feature-grid">
              {features.map((feature) => {
                const Icon = feature.Icon;

                return (
                  <article
                    className={`hb-feature ${feature.className}`}
                    key={feature.number}
                  >
                    <div className="hb-feature__top">
                      <span>{feature.number} / 04</span>
                      <ArrowUpRight size={23} />
                    </div>

                    <Icon
                      size={43}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />

                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="explore"
          className="hb-section hb-personality"
        >
          <div className="hb-container hb-personality__inner">
            <div>
              <span className="hb-eyebrow">
                YOUR STYLE. YOUR STORY.
              </span>

              <h2>
                Never look like
                <br />
                everyone else.
              </h2>

              <p>
                Your profile should feel like your own
                little corner of the internet.
                Make it bold, minimal, playful
                or anything in between.
              </p>

              <ul>
                <li>
                  <Check size={20} />
                  Expressive layouts
                </li>
                <li>
                  <Check size={20} />
                  Beautiful color palettes
                </li>
                <li>
                  <Check size={20} />
                  A profile that's truly yours
                </li>
              </ul>

              <a
                href="/#claim-username"
                className="hb-text-link"
              >
                Find your style
                <ArrowUpRight size={21} />
              </a>
            </div>

            <div className="hb-theme-stack" aria-hidden="true">
              <div className="hb-theme-card hb-theme-card--peach">
                <span>✳</span>
                the creative
              </div>

              <div className="hb-theme-card hb-theme-card--black">
                <span>↗</span>
                the original
              </div>

              <div className="hb-theme-card hb-theme-card--blue">
                <span>◎</span>
                the dreamer
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="hb-section hb-steps"
        >
          <div className="hb-container">
            <span className="hb-eyebrow">
              IT'S THAT SIMPLE
            </span>

            <h2>
              Three steps.
              <br />
              Endless possibilities.
            </h2>

            <div className="hb-steps-grid">
              {steps.map((step) => {
                const Icon = step.Icon;

                return (
                  <article
                    key={step.number}
                    className="hb-step"
                  >
                    <div>
                      <span>STEP {step.number}</span>
                      <Icon size={27} strokeWidth={1.7} />
                    </div>

                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                );
              })}
            </div>

            <p className="hb-steps__note">
              Free to get started. Upgrade only
              when you need more.
            </p>
          </div>
        </section>

        <section
          id="hype-drop"
          className="hb-section hb-hype"
        >
          <div className="hb-container hb-hype__inner">
            <div>
              <span className="hb-eyebrow">
                ANOTHER WORLD BY DIPO LABS
              </span>

              <h2>
                MEET
                <br />
                <span>HYPE</span>
                <br />
                DROP.
              </h2>

              <p>
                More than a profile. Another
                experience waiting to be discovered.
                HYPE DROP is a separate DIPO LABS
                product, with access for eligible
                HEYBIO Premium and Pro Max members.
              </p>

              <a
                href="/pricing"
                className="hb-hype__cta"
              >
                Explore eligible plans
                <ArrowUpRight size={20} />
              </a>
            </div>

            <div className="hb-hype__art">
              <span>DIPO LABS PRESENTS</span>
              <strong>
                HYPE
                <br />
                DROP
              </strong>
              <small>BEYOND ORDINARY ↗</small>
            </div>
          </div>
        </section>

        <section className="hb-section hb-final-cta">
          <div className="hb-container">
            <span className="hb-eyebrow">
              YOUR NEXT CHAPTER
            </span>

            <h2>
              The internet
              <br />
              looks better with you.
            </h2>

            <p>
              Your space is waiting. Let's make
              something beautiful.
            </p>

            <a
              href="/#claim-username"
              className="hb-final-cta__button"
            >
              Create your HEYBIO
              <ArrowUpRight size={22} />
            </a>

            <div className="hb-final-cta__trust">
              <span>
                <ShieldCheck size={18} />
                Your account. Your control.
              </span>
              <span>
                <Check size={18} />
                Start free.
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="hb-footer">
        <div className="hb-container">
          <div className="hb-footer__top">
            <div>
              <a href="/" className="hb-footer__brand">
                HEYBIO ↗
              </a>
              <p>
                Your world. One link.
                <br />
                Made by DIPO LABS.
              </p>
            </div>

            <div className="hb-footer__links">
              <a href="/#features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="/signup">Create account</a>
              <a href="/login">Log in</a>
              <a
                href="https://www.instagram.com/haybio.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a href="mailto:dipolabs123@gmail.com">
                Contact
              </a>
            </div>
          </div>

          <div className="hb-footer__bottom">
            <span>© {new Date().getFullYear()} DIPO LABS</span>
            <span>MADE FOR YOUR INTERNET ✳</span>
          </div>
        </div>
      </footer>
    </>
  );
}
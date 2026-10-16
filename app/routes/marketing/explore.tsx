
import { useState } from "react";
import type { MetaFunction } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  GraduationCap,
  Music2,
  Play,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";
import "../../styles/heybio-pages.css";

export const meta: MetaFunction = () => [
  {
    title: "Explore — HEYBIO | Find your kind of page",
  },
  {
    name: "description",
    content:
      "Explore illustrative HEYBIO page ideas for creators, musicians, freelancers, businesses and students.",
  },
];

const examples = [
  {
    id: "creator",
    label: "Creators",
    icon: Play,
    handle: "@thecreator",
    initials: "C",
    role: "Video creator · Storyteller",
    heading: "One place for every story.",
    description:
      "Videos, social channels, collaborations and featured posts — easy for your audience to find.",
    links: [
      "My latest video",
      "Behind the scenes",
      "Let's work together",
    ],
    tip: "Feature your newest work first.",
  },
  {
    id: "music",
    label: "Musicians",
    icon: Music2,
    handle: "@soundroom",
    initials: "S",
    role: "Independent artist",
    heading: "Give every release a home.",
    description:
      "Help listeners find your music, upcoming performances and the places you connect.",
    links: [
      "Listen to my music",
      "Upcoming shows",
      "Follow the journey",
    ],
    tip: "Put your newest release at the top.",
  },
  {
    id: "freelance",
    label: "Freelancers",
    icon: Camera,
    handle: "@madebymia",
    initials: "M",
    role: "Designer · Photographer",
    heading: "Make your first impression count.",
    description:
      "Put your portfolio, services and contact information together in one simple page.",
    links: [
      "View my portfolio",
      "Services & projects",
      "Get in touch",
    ],
    tip: "Lead with your strongest project.",
  },
  {
    id: "business",
    label: "Businesses",
    icon: BriefcaseBusiness,
    handle: "@smallstudio",
    initials: "B",
    role: "Independent business",
    heading: "Make it easier to find you.",
    description:
      "Guide customers toward products, bookings, opening information and your social channels.",
    links: [
      "Explore our products",
      "Book an appointment",
      "Contact the team",
    ],
    tip: "Use clear action words for your links.",
  },
  {
    id: "student",
    label: "Students",
    icon: GraduationCap,
    handle: "@nextchapter",
    initials: "N",
    role: "Student · Curious builder",
    heading: "Start building your presence.",
    description:
      "Keep projects, achievements, a résumé and your interests organized as you grow.",
    links: [
      "My projects",
      "See my résumé",
      "What I'm learning",
    ],
    tip: "Keep your bio short and memorable.",
  },
] as const;

type ExampleId = (typeof examples)[number]["id"];

export default function ExplorePage() {
  const [selected, setSelected] =
    useState<ExampleId>("creator");

  const example =
    examples.find((item) => item.id === selected) ??
    examples[0];

  return (
    <div className="hp-page hp-explore">
      <a className="hp-skip" href="#hp-main">
        Skip to content
      </a>

      <Navbar />

      <main id="hp-main">
        <section
          className="hp-section hp-hero hp-container hp-explore-hero"
          aria-labelledby="hp-title"
        >
          <span className="hp-kicker">
            <span className="hp-dot" />
            HEYBIO / EXPLORE
          </span>

          <h1 id="hp-title">
            Different people.{" "}
            <span>Infinite ways to share.</span>
          </h1>

          <p className="hp-lead">
            Whether you create, perform, study or run a
            business, your HEYBIO page can feel like your
            own corner of the internet.
          </p>

          <a
            href="#explore-examples"
            className="hp-btn hp-btn--lime"
          >
            Find your inspiration
            <ArrowRight size={18} aria-hidden="true" />
          </a>

          <div
            className="hp-explore-hero__marks"
            aria-hidden="true"
          >
            <span>CREATE</span>
            <span>CONNECT</span>
            <span>SHARE ↗</span>
          </div>
        </section>

        <section
          className="hp-section hp-section--soft"
          id="explore-examples"
          aria-labelledby="hp-example-title"
        >
          <div className="hp-container">
            <div className="hp-section-head hp-reveal">
              <span className="hp-kicker">
                MADE FOR YOUR WORLD
              </span>

              <h2 id="hp-example-title">
                Find the page that{" "}
                <span>feels like you.</span>
              </h2>

              <p>
                Choose a type of creator to see how a
                HEYBIO page could be organized.
                These examples are illustrative,
                not real accounts.
              </p>
            </div>

            <div
              className="hp-category-picker"
              role="group"
              aria-label="Choose a creator example"
            >
              {examples.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      selected === item.id
                        ? "hp-category hp-category--active"
                        : "hp-category"
                    }
                    aria-pressed={selected === item.id}
                    onClick={() => setSelected(item.id)}
                  >
                    <Icon
                      size={17}
                      aria-hidden="true"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="hp-example" key={example.id}>
              <div className="hp-example__text">
                <span className="hp-kicker">
                  {example.label.toUpperCase()} / EXAMPLE
                </span>

                <h3>{example.heading}</h3>

                <p>{example.description}</p>

                <div className="hp-example__tip">
                  <Sparkles
                    size={19}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Small tip. Big difference.
                    </strong>
                    <span>{example.tip}</span>
                  </div>
                </div>

                <a
                  href="/#claim-username"
                  className="hp-text-link"
                >
                  Create your own page
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div className="hp-example__stage">
                <div
                  className="hp-example__profile"
                  aria-label={`Illustrative ${example.label} HEYBIO profile`}
                >
                  <div
                    className="hp-example__avatar"
                    aria-hidden="true"
                  >
                    {example.initials}
                  </div>

                  <h4>{example.handle}</h4>
                  <p>{example.role}</p>

                  {example.links.map((link, index) => (
                    <div
                      key={link}
                      className={
                        index === 0
                          ? "hp-example__link hp-example__link--first"
                          : "hp-example__link"
                      }
                    >
                      {link}
                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                      />
                    </div>
                  ))}

                  <small>Made with HEYBIO ↗</small>
                </div>

                <div className="hp-example__label">
                  Example preview · Not a live profile
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="hp-section hp-container"
          aria-labelledby="hp-tips-title"
        >
          <div className="hp-section-head hp-reveal">
            <span className="hp-kicker">
              SIMPLE ADVICE
            </span>

            <h2 id="hp-tips-title">
              A little thoughtful detail{" "}
              <span>goes a long way.</span>
            </h2>
          </div>

          <div className="hp-notes">
            <article className="hp-note hp-note--lime hp-reveal">
              <span>01 / YOUR STORY</span>
              <h3>Say who you are.</h3>
              <p>
                A clear photo and a one-line bio
                make every profile more personal.
              </p>
            </article>

            <article className="hp-note hp-note--white hp-reveal">
              <span>02 / YOUR WORK</span>
              <h3>Show your best first.</h3>
              <p>
                Make your most useful or exciting
                link easy to find.
              </p>
            </article>

            <article className="hp-note hp-note--blue hp-reveal">
              <span>03 / YOUR MOMENT</span>
              <h3>Keep it fresh.</h3>
              <p>
                Update your page when a new project
                or milestone arrives.
              </p>
            </article>
          </div>
        </section>

        <section className="hp-section hp-final">
          <div className="hp-container hp-final__inner hp-reveal">
            <span className="hp-kicker">
              ONE PAGE. YOUR WAY.
            </span>

            <h2>
              Make space for <span>your world.</span>
            </h2>

            <p>
              Start simple, make it personal
              and share it anywhere.
            </p>

            <div className="hp-actions hp-actions--center">
              <a
                href="/#claim-username"
                className="hp-btn hp-btn--lime"
              >
                Claim your HEYBIO
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </a>

              <a
                href="/templates"
                className="hp-btn hp-btn--light"
              >
                Explore templates
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </div>
  );
}
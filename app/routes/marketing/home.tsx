
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Globe2,
  Heart,
  Layers3,
  Link2,
  LockKeyhole,
  MousePointerClick,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap
} from "lucide-react";

import Navbar from "../../components/marketing/Navbar";
import PremiumFooter from "../../components/marketing/PremiumFooter";

export function meta() {
  return [
    {
      title: "HEYBIO ↗ — Your world. One link."
    },
    {
      name: "description",
      content:
        "HEYBIO by DIPO LABS. A beautiful home for your links, content, creativity and everything you share."
    },
    {
      name: "robots",
      content: "index, follow"
    },
    {
      property: "og:title",
      content: "HEYBIO — Your world. One link."
    },
    {
      property: "og:description",
      content:
        "One beautiful place for everything that makes you, you."
    },
    {
      property: "og:type",
      content: "website"
    }
  ];
}

const features = [
  {
    number: "01",
    icon: Link2,
    title: "Every link. One place.",
    description:
      "Bring together your content, work, platforms and favorite corners of the internet.",
    className: "feature-card--lime"
  },
  {
    number: "02",
    icon: Palette,
    title: "Look like yourself.",
    description:
      "Build a profile that feels as unique as you are, with expressive colors and layouts.",
    className: "feature-card--ice"
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Understand your reach.",
    description:
      "Get meaningful insights into profile visits and link engagement.",
    className: "feature-card--white"
  },
  {
    number: "04",
    icon: Globe2,
    title: "Share it everywhere.",
    description:
      "Give people one memorable destination for your entire digital world.",
    className: "feature-card--dark"
  }
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Start sharing your world.",
    features: [
      "Your own HEYBIO profile",
      "Essential link tools",
      "Core profile themes",
      "Public shareable page"
    ],
    hypeDrop: false,
    featured: false
  },
  {
    name: "Pro",
    price: "149",
    description: "Create with more freedom.",
    features: [
      "Everything in Free",
      "More customization",
      "Enhanced creator tools",
      "Advanced profile options"
    ],
    hypeDrop: false,
    featured: false
  },
  {
    name: "Premium",
    price: "249",
    description: "Go beyond the ordinary.",
    features: [
      "Everything in Pro",
      "Premium design options",
      "Expanded creator insights",
      "HYPE DROP access"
    ],
    hypeDrop: true,
    featured: true
  },
  {
    name: "Pro Max",
    price: "499",
    description: "Built for your next level.",
    features: [
      "Everything in Premium",
      "Top-tier customization",
      "Extended creator capabilities",
      "HYPE DROP access"
    ],
    hypeDrop: true,
    featured: false
  }
] as const;

const faqs = [
  {
    question: "What is HEYBIO?",
    answer:
      "HEYBIO is a link-in-bio platform by DIPO LABS, designed to give your links, content and digital identity one beautiful home."
  },
  {
    question: "Can I start for free?",
    answer:
      "Yes. HEYBIO has a Free plan at ₹0. Paid plans are optional and will become available when account registration and billing launch."
  },
  {
    question: "How will paid subscriptions work?",
    answer:
      "Paid plans are designed for monthly billing through Razorpay with your authorization. Checkout, renewal management and cancellation will be available when billing launches."
  },
  {
    question: "Which plans include HYPE DROP?",
    answer:
      "Premium at ₹249/month and Pro Max at ₹499/month include HYPE DROP access. Free and Pro do not."
  },
  {
    question: "Is HYPE DROP part of HEYBIO?",
    answer:
      "HYPE DROP is a separate DIPO LABS product. HEYBIO will connect eligible subscribers to it securely."
  }
];

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function CreatorPreview() {
  return (
    <div
      className="creator-preview"
      aria-label="Illustrative HEYBIO creator profile preview"
    >
      <div className="creator-preview__top">
        <span className="creator-preview__domain">
          HEYBIO
          <ArrowUpRight size={13} aria-hidden="true" />
        </span>
        <span className="creator-preview__dots">•••</span>
      </div>

      <div className="creator-preview__body">
        <div className="creator-preview__avatar">
          <span aria-hidden="true">✳</span>
        </div>

        <h3>@yourworld</h3>

        <p>
          A little bit of everything.
          <br />
          All in one beautiful place.
        </p>

        <div className="creator-preview__socials">
          <span aria-hidden="true">◎</span>
          <span aria-hidden="true">✦</span>
          <span aria-hidden="true">◈</span>
        </div>

        <div className="creator-preview__links">
          <div className="preview-link">
            <span className="preview-link__symbol">
              <Sparkles size={18} />
            </span>
            <span>My latest work</span>
            <ArrowUpRight size={17} />
          </div>

          <div className="preview-link">
            <span className="preview-link__symbol">
              <Play size={18} fill="currentColor" />
            </span>
            <span>Watch my content</span>
            <ArrowUpRight size={17} />
          </div>

          <div className="preview-link">
            <span className="preview-link__symbol">
              <Heart size={18} />
            </span>
            <span>Things I love</span>
            <ArrowUpRight size={17} />
          </div>
        </div>
      </div>

      <div className="creator-preview__bottom">
        Made with <strong>HEYBIO ↗</strong>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__grid">
        <div className="hero__content">
          <div className="hero__announcement">
            <span className="hero__announcement-icon">✳</span>
            INTRODUCING A BETTER WAY TO BE ONLINE
          </div>

          <h1>
            Your world.
            <br />
            <span className="hero__highlight">
              One link
              <span className="hero__period">.</span>
            </span>
          </h1>

          <p className="hero__description">
            Your content. Your creativity. Your everything.
            Give your digital world one beautiful place
            to call home.
          </p>

          <div className="hero__actions">
            <a
              href="#pricing"
              className="button button--dark button--large"
            >
              Explore your possibilities
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>

            <a
              href="#how-it-works"
              className="hero__secondary-link"
            >
              See how it works
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="hero__microcopy">
            <span className="hero__microcopy-line" />
            Made for creators, dreamers and everyone in between.
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-orbit hero__visual-orbit--one" />
          <div className="hero__visual-orbit hero__visual-orbit--two" />

          <div className="hero__floating-label hero__floating-label--top">
            <Sparkles size={18} />
            MAKE IT YOURS
          </div>

          <CreatorPreview />

          <div className="hero__floating-label hero__floating-label--bottom">
            <span className="hero__floating-dot" />
            YOUR SPACE. YOUR RULES.
          </div>
        </div>
      </div>

      <a
        href="#explore"
        className="hero__scroll"
        aria-label="Scroll to explore"
      >
        SCROLL TO EXPLORE
        <ArrowDown size={16} />
      </a>
    </section>
  );
}

function Marquee() {
  const words = [
    "CREATE",
    "CONNECT",
    "EXPRESS",
    "SHARE",
    "BE YOU"
  ];

  return (
    <div className="marquee" aria-label="Create, connect, express, share, be you">
      <div className="marquee__track" aria-hidden="true">
        {[0, 1, 2, 3].map((repeat) => (
          <div className="marquee__group" key={repeat}>
            {words.map((word) => (
              <span key={`${repeat}-${word}`}>
                {word}
                <span className="marquee__star">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <section className="intro-section section-pad" id="explore">
      <div className="container intro-section__grid">
        <div className="intro-section__label">
          <span className="eyebrow">HELLO, INTERNET</span>
          <span className="intro-section__icon">↗</span>
        </div>

        <div className="intro-section__content">
          <h2>
            You are more than
            <br />
            <span>just one thing.</span>
          </h2>

          <p>
            So why should your online presence be? HEYBIO
            brings your stories, work, passions and links
            together in one thoughtfully designed space.
          </p>

          <a className="inline-link" href="#features">
            Discover what makes HEYBIO different
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="features-section section-pad" id="features">
      <div className="container">
        <div className="features-section__header">
          <SectionHeading
            eyebrow="MADE FOR MORE"
            title="Small link. Big possibilities."
            description="Everything you need to make a lasting first impression, beautifully brought together."
          />
          <span className="features-section__decor" aria-hidden="true">
            ✳
          </span>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className={`feature-card ${feature.className}`}
                key={feature.number}
              >
                <div className="feature-card__top">
                  <span>{feature.number} / 04</span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </div>

                <div className="feature-card__icon">
                  <Icon size={39} strokeWidth={1.5} />
                </div>

                <div className="feature-card__content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ThemesSection() {
  return (
    <section className="themes-section section-pad" id="templates">
      <div className="container themes-section__grid">
        <div className="themes-section__text">
          <SectionHeading
            eyebrow="YOUR STYLE. YOUR STORY."
            title="Never look like everyone else."
            description="Your profile should feel like your own little corner of the internet. Make it bold, minimal, playful or anything in between."
          />

          <div className="theme-benefits">
            <span><Check size={17} /> Expressive layouts</span>
            <span><Check size={17} /> Beautiful color palettes</span>
            <span><Check size={17} /> Mobile-first designs</span>
          </div>

          <a className="inline-link" href="#pricing">
            Find your style
            <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="themes-showcase">
          <div className="theme-card theme-card--peach">
            <span className="theme-card__mark">✷</span>
            <span className="theme-card__name">the creative</span>
            <div className="theme-card__pill" />
            <div className="theme-card__pill" />
          </div>

          <div className="theme-card theme-card--blue">
            <span className="theme-card__mark">◉</span>
            <span className="theme-card__name">the dreamer</span>
            <div className="theme-card__pill" />
            <div className="theme-card__pill" />
          </div>

          <div className="theme-card theme-card--dark">
            <span className="theme-card__mark">↗</span>
            <span className="theme-card__name">the original</span>
            <div className="theme-card__pill" />
            <div className="theme-card__pill" />
          </div>

          <span className="themes-showcase__caption">
            A LITTLE PREVIEW OF WHAT'S POSSIBLE
          </span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: MousePointerClick,
      title: "Claim your space",
      description:
        "Create an account and pick a username that feels like you."
    },
    {
      number: "02",
      icon: WandSparkles,
      title: "Make it yours",
      description:
        "Add links, shape your profile and choose your look."
    },
    {
      number: "03",
      icon: Zap,
      title: "Share your world",
      description:
        "Publish your HEYBIO and let people find everything in one place."
    }
  ];

  return (
    <section className="how-section section-pad" id="how-it-works">
      <div className="container">
        <SectionHeading
          eyebrow="IT'S THAT SIMPLE"
          title="Three steps. Endless possibilities."
        />

        <div className="how-grid">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article className="how-card" key={step.number}>
                <div className="how-card__top">
                  <span>STEP {step.number}</span>
                  <Icon size={24} strokeWidth={1.6} />
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>

                <span className="how-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            );
          })}
        </div>

        <p className="how-section__note">
          Account creation and profile publishing are
          being prepared for launch.
        </p>
      </div>
    </section>
  );
}

function HypeDropSection() {
  return (
    <section className="hype-section section-pad" id="hype-drop">
      <div className="container hype-section__grid">
        <div className="hype-section__content">
          <span className="eyebrow eyebrow--light">
            ANOTHER WORLD BY DIPO LABS
          </span>

          <h2>
            MEET
            <br />
            <span>HYPE</span>
            <br />
            DROP<span className="hype-section__period">.</span>
          </h2>

          <p>
            More than a profile. Another experience
            waiting to be discovered. Unlock HYPE DROP
            with HEYBIO Premium or Pro Max.
          </p>

          <a
            href="#pricing"
            className="button button--lime button--large"
          >
            See eligible plans
            <ArrowUpRight size={19} />
          </a>
        </div>

        <div className="hype-section__visual" aria-hidden="true">
          <div className="hype-art">
            <span className="hype-art__small">
              DIPO LABS PRESENTS
            </span>

            <div className="hype-art__center">
              HYPE
              <br />
              <em>DROP</em>
            </div>

            <div className="hype-art__footer">
              <span>BEYOND ORDINARY</span>
              <Layers3 size={28} />
            </div>
          </div>

          <div className="hype-section__sticker">
            <LockKeyhole size={18} />
            PREMIUM ACCESS
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="pricing-section section-pad" id="pricing">
      <div className="container">
        <div className="pricing-section__header">
          <SectionHeading
            eyebrow="SIMPLE, TRANSPARENT PRICING"
            title="Find your kind of extraordinary."
            description="Start free. Choose more possibilities when you're ready."
          />

          <div className="pricing-section__billing">
            MONTHLY PLANS
            <span>₹ INR</span>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              className={`pricing-card ${
                plan.featured ? "pricing-card--featured" : ""
              }`}
              key={plan.name}
            >
              {plan.featured && (
                <div className="pricing-card__badge">
                  THE SWEET SPOT ✳
                </div>
              )}

              <div className="pricing-card__header">
                <span className="pricing-card__name">
                  {plan.name}
                </span>

                <p>{plan.description}</p>
              </div>

              <div className="pricing-card__price">
                <span className="pricing-card__currency">₹</span>
                <strong>{plan.price}</strong>
                <span className="pricing-card__period">
                  {plan.price === "0" ? "/forever" : "/month"}
                </span>
              </div>

              <div className="pricing-card__divider" />

              <ul className="pricing-card__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={17} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`pricing-card__hype ${
                  plan.hypeDrop
                    ? "pricing-card__hype--enabled"
                    : ""
                }`}
              >
                {plan.hypeDrop ? (
                  <Sparkles size={16} />
                ) : (
                  <LockKeyhole size={16} />
                )}
                HYPE DROP {plan.hypeDrop ? "included" : "locked"}
              </div>

              <div className="pricing-card__action">
                <span
                  className="button button--plan"
                  aria-label={`${plan.name} checkout coming soon`}
                >
                  Available at launch
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="pricing-section__footnote">
          <ShieldCheck size={17} />
          <p>
            Paid plans are intended for monthly recurring
            billing with customer authorization.
            Final checkout terms, applicable taxes and
            cancellation details will be shown before payment.
            Checkout is not live yet.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="faq-section section-pad" id="faq">
      <div className="container faq-section__grid">
        <div className="faq-section__intro">
          <span className="eyebrow">
            GOOD QUESTIONS, GOOD ANSWERS
          </span>

          <h2>
            Curious?
            <br />
            <span>We got you.</span>
          </h2>

          <p>
            A few things you might want to know
            about HEYBIO.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question}>
              <summary>
                <span className="faq-item__number">
                  0{index + 1}
                </span>

                <span className="faq-item__question">
                  {faq.question}
                </span>

                <ChevronDown
                  size={20}
                  className="faq-item__chevron"
                  aria-hidden="true"
                />
              </summary>

              <div className="faq-item__answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <div className="final-cta__symbol" aria-hidden="true">
          ✳
        </div>

        <span className="eyebrow">
          THIS IS YOUR MOMENT
        </span>

        <h2>
          The internet is big.
          <br />
          <span>Make your space.</span>
        </h2>

        <p>
          One link for everything that makes you, you.
        </p>

        <a
          href="#pricing"
          className="button button--dark button--large"
        >
          Discover HEYBIO
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Marquee />
        <IntroSection />
        <FeaturesSection />
        <ThemesSection />
        <HowItWorks />
        <HypeDropSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <PremiumFooter />
    </>
  );
}
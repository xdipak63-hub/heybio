
import {
  ArrowUpRight,
  BarChart3,
  Link2,
  Palette,
  Share2
} from "lucide-react";

const steps = [
  ["01", "Claim your username", "Choose an available name and create your account."],
  ["02", "Build your page", "Add your photo, bio and profile details."],
  ["03", "Bring your links", "Keep your content and important destinations together."],
  ["04", "Share your world", "Give your audience one memorable place to find you."]
] as const;

export default function FeaturesSection() {
  return (
    <>
      <section
        id="features"
        className="hm-section hm-features"
        aria-labelledby="hm-features-title"
      >
        <div className="hm-wrap">
          <div className="hm-section-head">
            <span className="hm-eyebrow">BUILT AROUND YOU</span>
            <h2 id="hm-features-title">
              A little link with a lot of possibility.
            </h2>
            <p>
              Everything essential to create a thoughtful home
              for your online identity.
            </p>
          </div>

          <div className="hm-features__grid">
            <article className="hm-feature hm-feature--main">
              <div className="hm-feature__icon">
                <Link2 size={25} aria-hidden="true" />
              </div>
              <div>
                <h3>All your links. Beautifully organized.</h3>
                <p>
                  Bring your videos, work, socials and projects
                  into one easy-to-share destination.
                </p>
              </div>
              <div className="hm-feature__sample" aria-hidden="true">
                <span>My latest project <ArrowUpRight size={17} /></span>
                <span>Explore my portfolio <ArrowUpRight size={17} /></span>
                <span>Find me everywhere <ArrowUpRight size={17} /></span>
              </div>
            </article>

            <article className="hm-feature">
              <Palette size={27} aria-hidden="true" />
              <h3>Make it yours.</h3>
              <p>
                Choose from expressive layouts and appearance options
                that reflect your style.
              </p>
            </article>

            <article className="hm-feature">
              <Share2 size={27} aria-hidden="true" />
              <h3>Share with confidence.</h3>
              <p>
                One profile URL for your social bios, content,
                portfolios and conversations.
              </p>
            </article>

            <article className="hm-feature hm-feature--wide">
              <BarChart3 size={27} aria-hidden="true" />
              <div>
                <h3>Understand your reach.</h3>
                <p>
                  Eligible plans include analytics tools to help
                  you understand profile and link activity.
                </p>
                <small>
                  Analytics availability depends on your plan
                  and the implemented tracking features.
                </small>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="hm-section hm-steps"
        aria-labelledby="hm-steps-title"
      >
        <div className="hm-wrap">
          <div className="hm-section-head">
            <span className="hm-eyebrow">FOUR SIMPLE STEPS</span>
            <h2 id="hm-steps-title">
              Your world, ready to share.
            </h2>
          </div>

          <ol className="hm-steps__grid">
            {steps.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}


import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import UsernameClaim from "./UsernameClaim";

export default function Hero() {
  return (
    <section className="hm-hero" aria-labelledby="hm-hero-title">
      <div className="hm-wrap hm-hero__grid">
        <div className="hm-hero__copy">
          <span className="hm-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            YOUR SPACE ON THE INTERNET
          </span>

          <h1 id="hm-hero-title">
            Everything you are.
            <span> One beautiful link.</span>
          </h1>

          <p className="hm-lead">
            Your content, work and favorite places on the internet,
            together in a personal page that feels like you.
          </p>

          <div id="claim-username" className="hm-hero__claim">
            <UsernameClaim />
          </div>

          <a className="hm-inline-link" href="#how-it-works">
            See how HEYBIO works
            <ArrowDown size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="hm-hero__visual">
          <div className="hm-profile" aria-label="Illustrative HEYBIO profile">
            <div className="hm-profile__top">
              <strong>HEYBIO ↗</strong>
              <span>PROFILE PREVIEW</span>
            </div>

            <div className="hm-profile__avatar" aria-hidden="true">
              <Sparkles size={32} strokeWidth={1.5} />
            </div>

            <h2>@yourworld</h2>
            <p>Creator. Explorer. A little bit of everything.</p>

            <div className="hm-profile__links">
              {["My latest work", "Watch my videos", "Explore my world"].map(
                (item) => (
                  <div key={item} className="hm-profile__link">
                    <span>{item}</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </div>
                )
              )}
            </div>

            <small>Made with HEYBIO ↗</small>
          </div>

          <div className="hm-hero__visual-note">
            One page. So many possibilities.
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowDownRight, ArrowUpRight, Check, Globe2, Instagram, Music2, Play, ShoppingBag } from "lucide-react";
import UsernameClaim from "./UsernameClaim";

const previewLinks = [
  { label: "My latest video", Icon: Play },
  { label: "Listen to my music", Icon: Music2 },
  { label: "Shop my favorites", Icon: ShoppingBag },
];

export default function Hero() {
  return (
    <section className="hx-hero" aria-labelledby="hx-hero-title">
      <div className="hx-container hx-hero__grid">
        <div className="hx-hero__content">
          <span className="hx-kicker"><span className="hx-kicker__dot" /> YOUR WORLD. ONE LINK.</span>
          <h1 id="hx-hero-title">Everything you share.<span> One beautiful page.</span></h1>
          <p className="hx-hero__lead">Create your own mini website for your Instagram, videos, music, portfolio, store and more. All together in a link that feels like you.</p>
          <div id="claim-username" className="hx-hero__claim"><UsernameClaim /></div>
          <a className="hx-hero__learn" href="#how-it-works">See how it works <ArrowDownRight size={17} aria-hidden="true" /></a>
          <div className="hx-hero__proof" aria-label="HEYBIO starter benefits">
            <span><Check size={15} aria-hidden="true" /> Start free</span>
            <span><Check size={15} aria-hidden="true" /> Made for mobile</span>
            <span><Check size={15} aria-hidden="true" /> Share anywhere</span>
          </div>
        </div>

        <div className="hx-hero__stage" aria-label="Illustrative preview of a HEYBIO creator page">
          <div className="hx-hero__halo" aria-hidden="true" />
          <div className="hx-float hx-float--left" aria-hidden="true"><Instagram size={18} /> Socials</div>
          <div className="hx-float hx-float--right" aria-hidden="true"><Globe2 size={18} /> Portfolio</div>
          <div className="hx-phone">
            <div className="hx-phone__bar"><span className="hx-phone__domain">heybio.in/yourworld</span><ArrowUpRight size={16} aria-hidden="true" /></div>
            <div className="hx-phone__cover" aria-hidden="true"><span className="hx-phone__cover-mark">↗</span><span>MADE FOR WHAT'S NEXT</span></div>
            <div className="hx-phone__identity">
              <div className="hx-phone__avatar" aria-hidden="true">Y</div>
              <h2>Your World <span aria-hidden="true">✳</span></h2>
              <p>Creator • Music • Everyday moments</p>
              <div className="hx-phone__socials"><Instagram size={17}/><Play size={17}/><Music2 size={17}/></div>
            </div>
            <div className="hx-phone__links">
              {previewLinks.map(({ label, Icon }, index) => (
                <div key={label} className={`hx-phone__link ${index === 0 ? "hx-phone__link--featured" : ""}`}>
                  <Icon size={17} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={16} aria-hidden="true" />
                </div>
              ))}
            </div>
            <span className="hx-phone__made">Made with <strong>HEYBIO ↗</strong></span>
          </div>
          <div className="hx-hero__stage-note"><span className="hx-hero__stage-spark" aria-hidden="true">✦</span> YOUR SPACE ON THE INTERNET</div>
          <p className="hx-hero__demo">Illustrative creator page preview</p>
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="hx-final" aria-labelledby="hx-final-title">
      <div className="hx-container hx-final__content" data-hx-reveal>
        <span className="hx-kicker">THE NEXT CHAPTER IS YOURS</span>
        <h2 id="hx-final-title">Your world deserves<br/><span>its own place.</span></h2>
        <p>Start with your name. Add what matters. Share a link that feels like you.</p>
        <a className="hx-cta" href="/#claim-username">Claim my HEYBIO <ArrowUpRight size={19} aria-hidden="true"/></a>
        <span className="hx-final__note">Free to start. Made to grow with you.</span>
        <div className="hx-final__wordmark" aria-hidden="true">HEYBIO<span>↗</span></div>
      </div>
    </section>
  );
}

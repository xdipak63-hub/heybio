
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="hm-final" aria-labelledby="hm-final-title">
      <div className="hm-wrap hm-final__inner">
        <span className="hm-eyebrow">YOUR NEXT CHAPTER</span>

        <h2 id="hm-final-title">
          The internet has room for
          <span> your world.</span>
        </h2>

        <p>
          Your work, your creativity, your favorite links.
          Give them a place to belong.
        </p>

        <a href="/#claim-username" className="hm-button hm-button--lime">
          Claim my HEYBIO
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>

        <div className="hm-final__note">
          <ShieldCheck size={17} aria-hidden="true" />
          Free to start. Your space, your choice.
        </div>

        <strong className="hm-final__signature">
          HEYBIO <span>↗</span>
        </strong>
      </div>
    </section>
  );
}

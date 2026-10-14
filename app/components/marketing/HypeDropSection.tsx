
import {
  ArrowUpRight,
  CalendarDays,
  LockKeyhole,
  Rocket,
  Sparkles
} from "lucide-react";

export default function HypeDropSection() {
  return (
    <section
      id="hype-drop"
      className="hm-section hm-hype"
      aria-labelledby="hm-hype-title"
    >
      <div className="hm-wrap hm-hype__grid">
        <div>
          <span className="hm-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            ANOTHER PRODUCT BY DIPO LABS
          </span>

          <h2 id="hm-hype-title">
            Meet HYPE DROP.
            <span> Make every launch feel legendary.</span>
          </h2>

          <p>
            A separate launch-promotion experience for creators
            preparing something worth sharing — from music and
            videos to new projects and announcements.
          </p>

          <div className="hm-hype__features">
            <span><CalendarDays size={17} /> Scheduled launches</span>
            <span><Rocket size={17} /> Launch experiences</span>
            <span><LockKeyhole size={17} /> Premium access</span>
          </div>

          <a href="/pricing" className="hm-button hm-button--lime">
            Explore eligible plans
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>

          <small>
            HYPE DROP is separate from HEYBIO. Access is available
            only with verified active Premium or Pro Max eligibility.
            Free and Pro do not include access.
          </small>
        </div>

        <div className="hm-hype__art" aria-label="HYPE DROP promotional artwork">
          <span>DIPO LABS PRESENTS</span>
          <strong>HYPE<br />DROP<span>↗</span></strong>
          <div className="hm-hype__art-bottom">
            <span>THE MOMENT BEFORE THE MOMENT.</span>
            <span>00 : 00 : 00</span>
          </div>
          <small>Illustrative launch visual — not a live countdown</small>
        </div>
      </div>
    </section>
  );
}

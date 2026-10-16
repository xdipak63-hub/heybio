import { ArrowUpRight, CalendarDays, LockKeyhole, Rocket } from "lucide-react";

export default function HypeDropSection() {
  return (
    <section className="hx-hype" id="hype-drop" aria-labelledby="hx-hype-title">
      <div className="hx-container hx-hype__inner">
        <div className="hx-hype__content" data-hx-reveal>
          <span className="hx-hype__eyebrow">ANOTHER PRODUCT BY DIPO LABS</span>
          <h2 id="hx-hype-title">Big news deserves <em>a moment.</em></h2>
          <p>Meet <strong>HYPE DROP ↗</strong> — a separate experience designed around scheduled creator launches, anticipation and the big reveal.</p>
          <div className="hx-hype__tags"><span><CalendarDays size={16}/> Plan</span><span><Rocket size={16}/> Launch</span><span><LockKeyhole size={16}/> Premium access</span></div>
          <a className="hx-hype__link" href="/pricing">See eligible plans <ArrowUpRight size={18}/></a>
          <small>HYPE DROP access requires a verified active Premium or Pro Max subscription. Not included in Free or Pro. Cross-product access integration is still under development.</small>
        </div>
        <div className="hx-hype__visual" aria-label="Concept illustration of a scheduled HYPE DROP launch" data-hx-reveal>
          <div className="hx-hype__visual-top"><span>HYPE DROP ↗</span><span>BY DIPO LABS</span></div>
          <div className="hx-hype__orbit" aria-hidden="true"><span>↗</span></div>
          <div className="hx-hype__launch"><span>YOUR NEXT BIG THING</span><strong>Make every launch<br/>feel legendary.</strong><span>PLAN → BUILD ANTICIPATION → REVEAL</span></div>
          <span className="hx-hype__demo">Illustrative promotional concept</span>
        </div>
      </div>
    </section>
  );
}

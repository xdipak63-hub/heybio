import { ArrowUpRight, Plus } from "lucide-react";

const questions = [
  { q: "What exactly is HEYBIO?", a: "HEYBIO is a link-in-bio and mini website platform. Create a personal page for your links, social accounts, content and work — and share it with one link." },
  { q: "Can I really start for free?", a: "Yes. The Free plan is ₹0 and includes essential link management and a public creator profile. Optional paid plans are explained on our Pricing page." },
  { q: "Do my visitors need to sign up?", a: "No. Visitors can open a public creator page and follow its links without creating a HEYBIO account." },
  { q: "Can I change my links later?", a: "Yes. You can manage your profile and links from your creator dashboard. Some customization features depend on your plan." },
  { q: "Is HYPE DROP included for everyone?", a: "No. HYPE DROP is a separate DIPO LABS product. Only verified active Premium and Pro Max subscribers are eligible; Free and Pro are not. Cross-product access integration is still in development." },
  { q: "Where can I get help?", a: "Email our team at dipolabs123@gmail.com. You can also reach us through the Contact page." },
] as const;

export default function FAQSection() {
  return (
    <section className="hx-section hx-faq" id="faq" aria-labelledby="hx-faq-title">
      <div className="hx-container hx-faq__grid">
        <div className="hx-faq__copy" data-hx-reveal>
          <span className="hx-kicker">QUESTIONS, ANSWERED</span>
          <h2 id="hx-faq-title">Good to know.<span> Easy to understand.</span></h2>
          <p>Clear answers for creators starting their HEYBIO journey.</p>
          <a className="hx-text-link" href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Support">Talk to support <ArrowUpRight size={17}/></a>
        </div>
        <div className="hx-faq__items" data-hx-reveal>
          {questions.map(({ q, a }) => (
            <details className="hx-faq__item" key={q}>
              <summary><span>{q}</span><Plus size={18} aria-hidden="true"/></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

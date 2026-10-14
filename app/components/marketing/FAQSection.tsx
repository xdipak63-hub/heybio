
import { ArrowUpRight, Plus } from "lucide-react";

const faqs = [
  {
    question: "What is HEYBIO?",
    answer:
      "HEYBIO is a creator link-in-bio and mini website platform. It helps you bring your important links, content and work together in one personal page."
  },
  {
    question: "Can I start for free?",
    answer:
      "Yes. The Free plan costs ₹0 and includes a public profile and essential links."
  },
  {
    question: "Can I customize my page?",
    answer:
      "Custom themes and advanced appearance options are included in eligible paid plans. Available customization depends on the implemented features."
  },
  {
    question: "Which plans include HYPE DROP?",
    answer:
      "Premium and Pro Max include HYPE DROP eligibility. Free and Pro do not. Access also requires an active, verified eligible subscription."
  },
  {
    question: "How do paid subscriptions work?",
    answer:
      "Paid plans are billed monthly through an authorized payment flow. Activation depends on server-verified payment and subscription status. The applicable billing terms are shown during checkout."
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Cancellation is managed through the billing system. The effective cancellation date and access period depend on your verified subscription and provider status."
  },
  {
    question: "Do visitors need an account?",
    answer:
      "Visitors should be able to open a published public HEYBIO profile without creating an account."
  }
] as const;

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="hm-section hm-faq"
      aria-labelledby="hm-faq-title"
    >
      <div className="hm-wrap hm-faq__grid">
        <div>
          <span className="hm-eyebrow">GOOD TO KNOW</span>
          <h2 id="hm-faq-title">Questions? Meet answers.</h2>
          <p>
            The essentials about creating, sharing and managing
            your HEYBIO.
          </p>

          <a
            className="hm-inline-link"
            href="mailto:dipolabs123@gmail.com?subject=HEYBIO%20Support"
          >
            Contact support
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="hm-faq__items">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                <span>{faq.question}</span>
                <Plus size={19} aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

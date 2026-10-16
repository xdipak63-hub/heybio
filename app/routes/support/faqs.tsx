
import { useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Search, X } from "lucide-react";

import {
  EditorialHero,
  EditorialLayout,
  Eyebrow,
} from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Frequently asked questions — HEYBIO" },
  {
    name: "description",
    content:
      "Answers to common questions about HEYBIO pages, accounts, pricing and HYPE DROP eligibility.",
  },
];

const questions = [
  {
    category: "Getting started",
    q: "What is HEYBIO?",
    a: "HEYBIO is a link-in-bio and mini website platform. You can add your creator identity and useful links to one personal page.",
  },
  {
    category: "Getting started",
    q: "Do I need an account to view a creator page?",
    a: "No. Visitors can open available public creator pages without signing in.",
  },
  {
    category: "Getting started",
    q: "How do I choose my HEYBIO username?",
    a: "Select Claim my HEYBIO, sign up or sign in, and complete the username step. Usernames must be unique.",
  },
  {
    category: "Creator page",
    q: "How can I add or rearrange links?",
    a: "Open Dashboard → My Links. You can create, edit, enable, disable, delete and reorder links that belong to your profile.",
  },
  {
    category: "Creator page",
    q: "Where do I copy my public page link?",
    a: "Open Dashboard → Share. It gives you the URL for your saved username on the current HEYBIO website.",
  },
  {
    category: "Plans",
    q: "Is there a free plan?",
    a: "Yes. Free costs ₹0 and includes a public creator profile and basic links.",
  },
  {
    category: "Plans",
    q: "What are the monthly prices?",
    a: "Pro is ₹149/month, Premium is ₹249/month, and Pro Max is ₹499/month. Review checkout details before authorizing any payment.",
  },
  {
    category: "Plans",
    q: "Which plans include HYPE DROP?",
    a: "Premium and Pro Max are eligible. Free and Pro do not include HYPE DROP. Actual access also requires a verified active subscription and completion of the separate product integration.",
  },
  {
    category: "Billing",
    q: "Are paid subscriptions available now?",
    a: "Paid billing is still undergoing integration and testing. A plan shown on the Pricing page is not a guarantee that live checkout is enabled.",
  },
  {
    category: "Support",
    q: "How can I reach HEYBIO support?",
    a: "Email dipolabs123@gmail.com. Never send your password, OTP or payment credentials.",
  },
] as const;

export default function FAQs() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return term
      ? questions.filter(({ q, a, category }) =>
          `${q} ${a} ${category}`
            .toLocaleLowerCase()
            .includes(term),
        )
      : questions;
  }, [query]);

  return (
    <EditorialLayout>
      <EditorialHero
        label="HEYBIO / HELP CENTER"
        title={<>Questions? <em>Answers.</em></>}
        description="The essentials about creator pages, subscriptions and getting help."
      />

      <section
        className="he-container he-section"
        aria-labelledby="faq-heading"
      >
        <div className="he-heading">
          <Eyebrow>COMMON QUESTIONS</Eyebrow>
          <h2 id="faq-heading">Find an answer.</h2>
        </div>

        <div className="hb-faq-search">
          <Search size={19} aria-hidden="true" />

          <label
            className="hb-visually-hidden"
            htmlFor="faq-search"
          >
            Search frequently asked questions
          </label>

          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <p
          className="hb-faq-count"
          aria-live="polite"
        >
          {results.length}{" "}
          {results.length === 1 ? "answer" : "answers"} found
        </p>

        {results.length > 0 ? (
          <div className="hb-faq-list">
            {results.map(({ category, q, a }) => (
              <details
                key={q}
                className="hb-faq-item"
              >
                <summary>
                  <span>
                    <small>{category}</small>
                    <strong>{q}</strong>
                  </span>

                  <span aria-hidden="true">+</span>
                </summary>

                <p>{a}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="hb-faq-empty">
            No matching question.{" "}
            <a href="/contact">
              Ask the HEYBIO team
            </a>.
          </p>
        )}
      </section>
    </EditorialLayout>
  );
}

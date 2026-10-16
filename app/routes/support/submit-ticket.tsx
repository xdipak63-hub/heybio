
import { useState } from "react";

import {
  Link,
  data,
  useFetcher,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  CircleCheck,
  LifeBuoy,
  LockKeyhole,
  Send,
} from "lucide-react";

import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Support requests — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

const categories = [
  { value: "general", label: "General question" },
  { value: "account", label: "Account & sign-in" },
  { value: "billing", label: "Billing & subscription" },
  { value: "technical", label: "Technical problem" },
  { value: "abuse", label: "Safety & abuse report" },
  { value: "other", label: "Something else" },
] as const;

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
};

type Result = {
  ok?: boolean;
  error?: string;
  ticketId?: string;
};

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const { data: tickets, error } = await client.supabase
    .from("support_tickets")
    .select("id,subject,category,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Response("Could not load your support requests.", {
      status: 503,
      headers: client.headers,
    });
  }

  const category =
    new URL(request.url).searchParams.get("category") ??
    "general";

  return data(
    {
      tickets: (tickets ?? []) as Ticket[],
      category: categories.some(
        (item) => item.value === category,
      )
        ? category
        : "general",
    },
    { headers: client.headers },
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(date);
}

export default function SubmitTicket() {
  const { tickets, category } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<Result>();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const busy = fetcher.state !== "idle";

  const saved =
    fetcher.state === "idle" &&
    fetcher.data?.ok === true;

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          to="/support/help-center"
          className="hb-workspace__back"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Help Center
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              PRIVATE SUPPORT · DIPO LABS
            </span>

            <h1>
              <LifeBuoy size={29} aria-hidden="true" />
              Support requests
            </h1>

            <p>
              Tell us what happened. Your message is
              attached to your signed-in account.
            </p>
          </div>
        </header>

        <div className="hb-workspace__note" role="note">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>
            Never include passwords, OTPs, UPI PINs or
            full payment details. You can submit up to
            three requests per hour.
          </span>
        </div>

        {saved ? (
          <section
            className="hb-workspace__status"
            role="status"
            aria-live="polite"
          >
            <CircleCheck size={22} aria-hidden="true" />

            <div>
              <strong>Request received.</strong>

              <p>
                Reference: <code>{fetcher.data?.ticketId}</code>.
                It's saved to your account.
              </p>

              <Link
                to="/support/submit-ticket"
                reloadDocument
                className="hb-workspace__button"
              >
                Write another request
              </Link>
            </div>
          </section>
        ) : (
          <fetcher.Form
            method="post"
            action="/api/support-ticket"
            className="appearance-panel"
            style={{
              display: "grid",
              gap: 18,
              padding: 26,
              background: "#fff",
              borderRadius: 20,
            }}
          >
            <label style={{ display: "grid", gap: 7 }}>
              What do you need help with?

              <select
                key={category}
                name="category"
                defaultValue={category}
                required
                style={{
                  minHeight: 48,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                {categories.map((item) => (
                  <option
                    value={item.value}
                    key={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 7 }}>
              Subject

              <input
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                minLength={5}
                maxLength={160}
                required
                placeholder="A short summary"
                style={{
                  minHeight: 48,
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 7 }}>
              Details

              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minLength={10}
                maxLength={10000}
                rows={7}
                required
                placeholder="What happened, what you expected, and any relevant non-sensitive details…"
                style={{
                  borderRadius: 10,
                  padding: 12,
                  resize: "vertical",
                }}
              />
            </label>

            <p
              style={{
                color: "#5F6067",
                fontSize: 13,
                margin: 0,
              }}
            >
              {message.length} / 10,000 characters
            </p>

            {fetcher.data?.error && (
              <p role="alert" style={{ color: "#9B1C1C" }}>
                {fetcher.data.error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="hb-workspace__button hb-workspace__button--primary"
              style={{ justifySelf: "start" }}
            >
              <Send size={16} aria-hidden="true" />

              {busy ? "Submitting…" : "Submit request"}
            </button>
          </fetcher.Form>
        )}

        <section
          style={{ marginTop: 48 }}
          aria-labelledby="tickets-heading"
        >
          <h2
            id="tickets-heading"
            style={{
              fontSize: 23,
              letterSpacing: "-.03em",
            }}
          >
            Your recent requests
          </h2>

          {tickets.length === 0 ? (
            <p style={{ color: "#5F6067" }}>
              No previous support requests.
            </p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  style={{
                    border: "1px solid #DEDEE3",
                    borderRadius: 14,
                    padding: 18,
                    background: "#FFF",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {ticket.subject}
                    </strong>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {ticket.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p
                    style={{
                      marginBottom: 0,
                      color: "#5F6067",
                      fontSize: 13,
                    }}
                  >
                    {ticket.category} ·{" "}
                    {formatDate(ticket.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
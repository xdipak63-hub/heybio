
import {
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  requireAdminPage,
} from "../../lib/auth/require-admin-page.server";

import {
  getServerBindings,
} from "../../lib/supabase/admin.server";

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Settings — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "settings.manage",
  );

  const env = getServerBindings(context);

  // Do not send actual secret values to the client.
  // Only configuration presence is exposed.

  const configuration = [
    {
      label: "Supabase project",

      ready: Boolean(
        env.SUPABASE_URL &&
          env.SUPABASE_PUBLISHABLE_KEY,
      ),
    },

    {
      label: "Supabase privileged backend key",

      ready: Boolean(
        env.SUPABASE_SERVICE_ROLE_KEY,
      ),
    },

    {
      label: "Razorpay credentials",

      ready: Boolean(
        env.RAZORPAY_KEY_ID &&
          env.RAZORPAY_KEY_SECRET,
      ),
    },

    {
      label: "Razorpay webhook signing key",

      ready: Boolean(
        env.RAZORPAY_WEBHOOK_SECRET,
      ),
    },

    {
      label: "Turnstile verification",

      ready: Boolean(
        env.TURNSTILE_SECRET_KEY,
      ),
    },
  ];

  return Response.json(
    {
      configuration,

      billingJobsEnabled:
        env.BILLING_JOBS_ENABLED === "true",
    },
    { headers: HEADERS },
  );
}

export default function AdminSettings() {
  const {
    configuration,
    billingJobsEnabled,
  } = useLoaderData<typeof loader>();

  return (
    <section className="hb-ops">
      <header className="hb-ops__header">
        <p className="hb-ops__eyebrow">
          PLATFORM OPERATIONS
        </p>

        <h2>Configuration health</h2>

        <p>
          Read-only environment diagnostics.
          Presence of a configured key does
          not prove the corresponding integration
          is working.
        </p>
      </header>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>Server bindings</strong>

          <span>
            Secret values never sent to browser
          </span>
        </div>

        <ul className="hb-ops__list">
          {configuration.map((item) => (
            <li
              className={[
                "hb-ops__item",
                "hb-ops__item-top",
              ].join(" ")}
              key={item.label}
            >
              <strong>{item.label}</strong>

              <span className="hb-ops__pill">
                {item.ready
                  ? "Configured"
                  : "Missing"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hb-ops__card">
        <div className="hb-ops__card-header">
          <strong>Scheduled billing jobs</strong>

          <span className="hb-ops__pill">
            {billingJobsEnabled
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>

        <p className="hb-ops__empty">
          Job execution, webhook processing
          and Razorpay reconciliation must
          be tested separately before
          production activation.
        </p>
      </div>

      <p className="hb-ops__note">
        Production secrets, pricing and
        subscription access must never be
        changed through an unverified frontend
        form. Deploy configuration updates
        through Cloudflare and audited backend
        workflows.
      </p>
    </section>
  );
}
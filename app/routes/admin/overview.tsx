
import {
  Activity,
  CreditCard,
  ShieldCheck,
  Users
} from "lucide-react";

import {
  type LoaderFunctionArgs
} from "react-router";

import StatCard from "../../components/admin/StatCard";

import {
  requireAdminPage
} from "../../lib/auth/require-admin-page.server";

export function meta() {
  return [
    {
      title: "Admin Overview — HEYBIO"
    },
    {
      name: "robots",
      content: "noindex, nofollow"
    }
  ];
}

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "dashboard.read"
  );

  return Response.json(
    {
      verified: true
    },
    {
      headers: {
        "Cache-Control":
          "private, no-store, max-age=0"
      }
    }
  );
}

export default function AdminOverview() {
  return (
    <div className="hb-admin-overview">
      <section className="hb-admin-overview__intro">
        <div className="hb-admin-overview__eyebrow">
          <ShieldCheck
            size={16}
            aria-hidden="true"
          />
          Secure workspace
        </div>

        <h2>Platform overview</h2>

        <p>
          Manage HEYBIO operations with
          verified information and
          permission-controlled actions.
        </p>
      </section>

      <div className="hb-admin-overview__stats">
        <StatCard
          label="Total users"
          value={null}
          icon={<Users size={20} />}
          description="Awaiting verified data"
        />

        <StatCard
          label="Subscriptions"
          value={null}
          icon={<CreditCard size={20} />}
          description="Awaiting verified data"
        />

        <StatCard
          label="Platform activity"
          value={null}
          icon={<Activity size={20} />}
          description="Awaiting verified data"
        />
      </div>

      <section className="hb-admin-overview__notice">
        <ShieldCheck
          size={22}
          aria-hidden="true"
        />

        <div>
          <h3>Protected administration</h3>

          <p>
            This workspace requires an approved
            verified identity, active administrator
            role and multi-factor authentication.
            Live metrics will appear when the
            protected data loaders are connected.
          </p>
        </div>
      </section>
    </div>
  );
}

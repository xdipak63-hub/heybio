import { data, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import {
  ArrowLeft,
  ArrowUpRight,
  CircleHelp,
  Eye,
  Link2,
  Mail,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";

import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Creator tools — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { client } = await requireUser(request, context);

  return data(
    { authorized: true },
    { headers: client.headers },
  );
}

const tools = [
  {
    to: "/dashboard/links",
    title: "My links",
    body: "Add, edit and reorder your destinations.",
    icon: Link2,
  },
  {
  to: "/dashboard/social-links",
  title: "Social links",
  body: "Connect and manage your social profiles.",
  icon: Share2,
},
  {
    to: "/dashboard/appearance",
    title: "Appearance",
    body: "Edit your profile details and saved theme.",
    icon: Palette,
  },
  {
    to: "/dashboard/preview",
    title: "Page preview",
    body: "Review your active links before sharing.",
    icon: Eye,
  },
  {
    to: "/dashboard/share",
    title: "Share",
    body: "Copy and share your public HEYBIO address.",
    icon: Share2,
  },
  {
    to: "/pricing",
    title: "Plans & pricing",
    body: "Compare verified HEYBIO plan entitlements.",
    icon: Sparkles,
  },
  {
    to: "/support/help-center",
    title: "Help Center",
    body: "Find answers and setup guidance.",
    icon: CircleHelp,
  },
  {
    to: "/contact",
    title: "Contact support",
    body: "Get in touch with the DIPO LABS team.",
    icon: Mail,
  },
] as const;

export default function DashboardMore() {
  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container">
        <Link
          to="/dashboard"
          className="hb-workspace__back"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR CREATOR TOOLKIT
            </span>

            <h1>Everything in one place.</h1>

            <p>
              Jump straight to the HEYBIO tools
              that are available today.
            </p>
          </div>
        </header>

        <div className="hb-workspace__grid">
          {tools.map(({
            to,
            title,
            body,
            icon: Icon,
          }) => (
            <Link
              className="hb-workspace__tile"
              to={to}
              key={to}
            >
              <span className="hb-workspace__tile-icon">
                <Icon size={23} aria-hidden="true" />
              </span>

              <ArrowUpRight
                className="hb-workspace__tile-arrow"
                size={19}
                aria-hidden="true"
              />

              <strong>{title}</strong>
              <span>{body}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

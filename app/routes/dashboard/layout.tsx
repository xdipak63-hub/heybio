
import {
  useEffect,
  useState,
} from "react";

import {
  data,
  Form,
  Link,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useNavigation,
  type LoaderFunctionArgs,
  type MetaFunction
} from "react-router";

import {
  BarChart3,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Link2,
  Menu,
  Palette,
  Settings,
  X,
} from "lucide-react";

import MobileNavigation from "../../components/creator/MobileNavigation";
import { requireUser } from "../../lib/auth/require-user.server";

import "./dashboard-shell.css";

const ITEMS = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/links",
    label: "My Links",
    icon: Link2,
    end: false,
  },
  {
    to: "/dashboard/appearance",
    label: "Appearance",
    icon: Palette,
    end: false,
  },
  {
    to: "/dashboard/analytics",
    label: "Insights",
    icon: BarChart3,
    end: false,
  },
  {
    to: "/dashboard/billing",
    label: "Billing",
    icon: CreditCard,
    end: false,
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    end: false,
  },
] as const;

export const meta: MetaFunction = () => [
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(
    request,
    context,
  );

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select(
        "username,display_name,account_status",
      )
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Unable to load creator workspace.",
      {
        status: 503,
        headers: client.headers,
      },
    );
  }

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  if (profile.account_status !== "active") {
    throw new Response(
      "Account unavailable.",
      {
        status: 403,
        headers: client.headers,
      },
    );
  }

  return data(
    {
      username: profile.username,
      displayName:
        profile.display_name ||
        profile.username,
      email: user.email ?? "",
    },
    {
      headers: new Headers([
        ...client.headers,
        ["Cache-Control", "private, no-store"],
        ["X-Robots-Tag", "noindex, nofollow"],
      ]),
    },
  );
}

export default function DashboardLayout() {
  const { username, displayName, email } =
    useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, [open]);

  return (
    <div className="hb-dash">
      <a className="hb-dash__skip" href="#creator-content">
        Skip to content
      </a>

      {open && (
        <button
          type="button"
          className="hb-dash__backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="creator-sidebar"
        className={`hb-dash__sidebar ${
          open ? "is-open" : ""
        }`}
        aria-label="Creator workspace sidebar"
      >
        <div className="hb-dash__brand-row">
          <Link
            to="/"
            className="hb-dash__brand"
          >
            HEYBIO<span>↗</span>
          </Link>

          <button
            type="button"
            className="hb-dash__close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="hb-dash__account">
          <div
            className="hb-dash__avatar"
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="hb-dash__account-copy">
            <strong>{displayName}</strong>
            <span>@{username}</span>
          </div>
        </div>

        <nav aria-label="Creator sections">
          <p className="hb-dash__nav-label">
            WORKSPACE
          </p>

          {ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `hb-dash__nav-link ${
                    isActive ? "is-active" : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="hb-dash__sidebar-bottom">
          <a
            href={`/${encodeURIComponent(username)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hb-dash__public-link"
          >
            View my page
            <ExternalLink
              size={16}
              aria-hidden="true"
            />
          </a>

          <Form action="/logout" method="post">
            <button
              type="submit"
              className="hb-dash__logout"
            >
              Log out
            </button>
          </Form>
        </div>
      </aside>

      <div className="hb-dash__main">
        <header className="hb-dash__topbar">
          <button
            type="button"
            className="hb-dash__menu"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="creator-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="hb-dash__topbar-label">
            <strong>Your creator space</strong>
            <span>Make your world yours.</span>
          </div>

          <div className="hb-dash__topbar-actions">
            <span className="hb-dash__email">
              {email}
            </span>

            <Link to="/dashboard/preview">
              Preview ↗
            </Link>
          </div>
        </header>

        <div
          id="creator-content"
          className="hb-dash__content"
          aria-busy={navigation.state !== "idle"}
        >
          <Outlet />
        </div>

        <footer className="hb-dash__footer">
          <span>HEYBIO ↗</span>
          <span>© 2026 DIPO LABS</span>
        </footer>
      </div>

      <MobileNavigation />
    </div>
  );
}
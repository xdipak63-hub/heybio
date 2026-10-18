
import { useEffect, useRef } from "react";
import { NavLink } from "react-router";
import Logo from "../shared/Logo";
import {
  Activity,
  BarChart3,
  CreditCard,
  FileClock,
  Flag,
  Headphones,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X
} from "lucide-react";

type Props = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const navigation = [
  {
    title: "Workspace",
    links: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/profiles", label: "Profiles", icon: Link2 },
      { to: "/admin/reports", label: "Reports", icon: Flag }
    ]
  },
  {
    title: "Business",
    links: [
      { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { to: "/admin/payments", label: "Payments", icon: Wallet },
      { to: "/admin/revenue", label: "Revenue", icon: BarChart3 },
      { to: "/admin/refunds", label: "Refunds", icon: Activity },
      { to: "/admin/hype-access", label: "HYPE DROP", icon: Sparkles }
    ]
  },
  {
    title: "Operations",
    links: [
      { to: "/admin/support", label: "Support", icon: Headphones },
      { to: "/admin/audit-logs", label: "Audit logs", icon: FileClock },
      { to: "/admin/security", label: "Security", icon: LockKeyhole },
      { to: "/admin/settings", label: "Settings", icon: Settings }
    ]
  }
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      closeButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="hb-admin-sidebar-backdrop"
          aria-label="Close admin navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "hb-admin-sidebar",
          mobileOpen ? "is-open" : ""
        ].join(" ")}
        aria-label="Admin sidebar"
      >
        <div className="hb-admin-sidebar__brand">
          <Logo href="/admin" size="sm" className="hb-admin-sidebar__logo" />

          <button
            ref={closeButtonRef}
            type="button"
            className="hb-admin-icon-button hb-admin-sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hb-admin-sidebar__identity">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>DIPO LABS · Admin</span>
        </div>

        <nav aria-label="Admin navigation">
          {navigation.map((group) => (
            <section
              className="hb-admin-sidebar__group"
              key={group.title}
            >
              <h2>{group.title}</h2>

              <div className="hb-admin-sidebar__links">
                {group.links.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={"end" in item ? item.end : false}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "hb-admin-sidebar__link",
                          isActive ? "is-active" : ""
                        ].join(" ")
                      }
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="hb-admin-sidebar__footer">
          <span>HEYBIO Administration</span>
          <small>By DIPO LABS</small>
        </div>
      </aside>
    </>
  );
}

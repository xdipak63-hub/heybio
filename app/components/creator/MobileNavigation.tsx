
import { NavLink } from "react-router";
import {
  ChartNoAxesColumn,
  LayoutDashboard,
  Link2,
  Palette,
  Settings
} from "lucide-react";

const items = [
  {
    to: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
    end: true
  },
  {
    to: "/dashboard/links",
    label: "Links",
    icon: Link2,
    end: false
  },
  {
    to: "/dashboard/appearance",
    label: "Design",
    icon: Palette,
    end: false
  },
  {
    to: "/dashboard/analytics",
    label: "Insights",
    icon: ChartNoAxesColumn,
    end: false
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    end: false
  }
] as const;

export default function MobileNavigation() {
  return (
    <nav
      className="hb-creator-mobile-nav"
      aria-label="Creator dashboard navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `hb-creator-mobile-nav__item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

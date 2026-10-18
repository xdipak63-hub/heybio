
import { NavLink } from "react-router";

import {
  ChartNoAxesColumn,
  LayoutDashboard,
  Link2,
  Palette,
  Rocket,
} from "lucide-react";

/**
 * HEYBIO Creator Mobile Navigation
 *
 * Five primary destinations keep the
 * bottom bar usable on narrow screens.
 *
 * HYPE DROP access is verified by its
 * server-side route loader, not by
 * the navigation component.
 */

const items = [
  {
    to: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/links",
    label: "Links",
    icon: Link2,
    end: false,
  },
  {
    to: "/dashboard/appearance",
    label: "Design",
    icon: Palette,
    end: false,
  },
  {
    to: "/dashboard/analytics",
    label: "Insights",
    icon: ChartNoAxesColumn,
    end: false,
  },
  {
    to: "/dashboard/hype-drop",
    label: "HYPE DROP",
    icon: Rocket,
    end: false,
  },
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
            aria-label={item.label}
            className={({ isActive }) =>
              [
                "hb-creator-mobile-nav__item",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <Icon
              size={20}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

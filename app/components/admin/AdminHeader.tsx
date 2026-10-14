
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Menu,
  ShieldCheck
} from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description?: string;
  adminEmail: string;
  onOpenSidebar?: () => void;
  actions?: ReactNode;
};

export default function AdminHeader({
  title,
  description,
  adminEmail,
  onOpenSidebar,
  actions
}: AdminHeaderProps) {
  return (
    <header className="hb-admin-header">
      <div className="hb-admin-header__main">
        {onOpenSidebar && (
          <button
            type="button"
            className="hb-admin-icon-button hb-admin-header__menu"
            onClick={onOpenSidebar}
            aria-label="Open admin navigation"
          >
            <Menu size={21} />
          </button>
        )}

        <div className="hb-admin-header__copy">
          <div className="hb-admin-header__eyebrow">
            <ShieldCheck size={14} aria-hidden="true" />
            DIPO LABS / Administration
          </div>

          <h1>{title}</h1>

          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="hb-admin-header__right">
        {actions}

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hb-admin-header__website"
        >
          View website
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>

        <div className="hb-admin-header__account">
          <div
            className="hb-admin-header__avatar"
            aria-hidden="true"
          >
            {adminEmail.charAt(0).toUpperCase()}
          </div>

          <div className="hb-admin-header__identity">
            <strong>Super Admin</strong>
            <span>{adminEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

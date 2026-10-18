
import { useState } from "react";

import {
  data,
  Outlet,
  useLoaderData,
  useNavigation,
  type LoaderFunctionArgs
} from "react-router";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

import {
  requireAdminPage
} from "../../lib/auth/require-admin-page.server";

export function meta() {
  return [
    {
      title: "Administration — HEYBIO"
    },
    {
      name: "robots",
      content: "noindex, nofollow, noarchive"
    }
  ];
}

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const admin = await requireAdminPage(
    request,
    context,
    "dashboard.read"
  );

  return data(
    {
      admin: {
        id: admin.user.id,
        email: admin.user.email ?? "",
        role: admin.role
      }
    },
    {
      headers: {
        "Cache-Control":
          "private, no-store, max-age=0",
        "X-Robots-Tag":
          "noindex, nofollow, noarchive"
      }
    }
  );
}

export default function AdminLayout() {
  const { admin } = useLoaderData<typeof loader>();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigation = useNavigation();

  return (
    <div className="hb-admin-shell">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="hb-admin-shell__main">
        <AdminHeader
          title="Administration"
          description="Secure HEYBIO management workspace."
          adminEmail={admin.email}
          onOpenSidebar={() =>
            setMobileOpen(true)
          }
        />

        <main
          id="admin-main"
          className="hb-admin-shell__content"
          aria-busy={navigation.state !== "idle"}
        >
          <Outlet />
        </main>

        <footer className="hb-admin-shell__footer">
          <span>HEYBIO ↗</span>
          <span>© 2026 DIPO LABS</span>
        </footer>
      </div>
    </div>
  );
}


import {
  Form,
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { ArrowUpRight, Search } from "lucide-react";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import { formatAdminDate } from "../../types/admin-ui";

const PAGE_SIZE = 20;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Profiles — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "users.read",
  );

  const url = new URL(request.url);

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(
        url.searchParams.get("page") || "1",
        10,
      ) || 1,
    ),
  );

  const status = [
    "active",
    "suspended",
    "deleted",
  ].includes(url.searchParams.get("status") || "")
    ? url.searchParams.get("status")!
    : "all";

  const q = (url.searchParams.get("q") ?? "")
    .trim()
    .slice(0, 40);

  if (q && !/^[a-z0-9_]+$/i.test(q)) {
    return Response.json(
      {
        profiles: [],
        total: 0,
        page: 1,
        status,
        q,
        invalid: true,
      },
      { headers: HEADERS },
    );
  }

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  let query = db
    .from("profiles")
    .select(
      "id,username,display_name,account_status,created_at,updated_at",
      { count: "exact" },
    );

  if (status !== "all") {
    query = query.eq("account_status", status);
  }

  if (q) {
    query = query.ilike("username", `%${q}%`);
  }

  const result = await query
    .order("created_at", { ascending: false })
    .range(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE - 1,
    );

  if (result.error || result.count == null) {
    throw new Response(
      "Could not load profiles",
      { status: 503, headers: HEADERS },
    );
  }

  return Response.json(
    {
      profiles: result.data ?? [],
      total: result.count,
      page,
      status,
      q,
      invalid: false,
    },
    { headers: HEADERS },
  );
}

export default function AdminProfiles() {
  const {
    profiles,
    total,
    page,
    status,
    q,
    invalid,
  } = useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  const linkTo = (p: number) =>
    `/admin/profiles?${new URLSearchParams({
      page: String(p),
      ...(status !== "all" ? { status } : {}),
      ...(q ? { q } : {}),
    })}`;

  return (
    <div
      style={{
        display: "grid",
        gap: 22,
      }}
    >
      <header>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          CREATOR DIRECTORY
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "7px 0",
          }}
        >
          Profiles
        </h2>

        <p>
          Stored creator profiles. Public links are
          shown only for active usernames; account
          edits require authorized workflows.
        </p>
      </header>

      <Form
        method="get"
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          Username

          <input
            name="q"
            defaultValue={q}
            maxLength={40}
            placeholder="Search username"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #dedee3",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Status

          <select
            name="status"
            defaultValue={status}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #dedee3",
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">
              Suspended
            </option>
            <option value="deleted">Deleted</option>
          </select>
        </label>

        <button
          type="submit"
          style={{
            padding: 12,
            border: 0,
            borderRadius: 10,
            background: "#BDF806",
            fontWeight: 750,
          }}
        >
          <Search
            size={16}
            style={{ verticalAlign: "middle" }}
          />{" "}
          Apply
        </button>

        <Link to="/admin/profiles">Reset</Link>
      </Form>

      {invalid && (
        <p role="alert">
          Username search accepts letters, numbers
          and underscores.
        </p>
      )}

      <section
        style={{
          overflowX: "auto",
          background: "#fff",
          border: "1px solid #dedee3",
          borderRadius: 18,
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 680,
            textAlign: "left",
          }}
        >
          <caption
            style={{
              textAlign: "left",
              padding: 20,
            }}
          >
            {total.toLocaleString("en-IN")} matching
            profiles
          </caption>

          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {[
                "Creator",
                "Username",
                "Status",
                "Created",
                "Open",
              ].map((t) => (
                <th
                  key={t}
                  scope="col"
                  style={{ padding: 15 }}
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {profiles.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderTop: "1px solid #e8e8ea",
                }}
              >
                <td style={{ padding: 15 }}>
                  {p.display_name || "Unnamed creator"}
                </td>

                <td style={{ padding: 15 }}>
                  {p.username
                    ? `@${p.username}`
                    : "—"}
                </td>

                <td style={{ padding: 15 }}>
                  {p.account_status}
                </td>

                <td style={{ padding: 15 }}>
                  {formatAdminDate(p.created_at)}
                </td>

                <td style={{ padding: 15 }}>
                  <Link
                    to={`/admin/users/${p.id}`}
                  >
                    Account
                  </Link>

                  {p.username &&
                  p.account_status === "active" ? (
                    <>
                      {" "}·{" "}
                      <a
                        href={`/${encodeURIComponent(
                          p.username,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Public{" "}
                        <ArrowUpRight
                          size={14}
                          style={{
                            verticalAlign: "middle",
                          }}
                        />
                      </a>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!profiles.length && (
          <p style={{ padding: 24 }}>
            No matching profiles.
          </p>
        )}
      </section>

      <nav
        aria-label="Profile pages"
        style={{
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        {page > 1 && (
          <Link to={linkTo(page - 1)}>
            ← Previous
          </Link>
        )}

        <span>
          Page {page} of {pages}
        </span>

        {page < pages && (
          <Link to={linkTo(page + 1)}>
            Next →
          </Link>
        )}
      </nav>
    </div>
  );
}
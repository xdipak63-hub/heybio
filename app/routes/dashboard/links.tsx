
import {
  data,
  redirect,
  useActionData,
  useLoaderData
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "react-router";

import { Link } from "react-router";

import LinkEditor from "../../components/creator/LinkEditor";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin
} from "../../lib/supabase/server";

import {
  validateLinkInput
} from "../../lib/validation/links.schema";

import type {
  CreatorLink
} from "../../lib/validation/links.schema";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function meta() {
  return [
    { title: "Manage Links — HEYBIO" },
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
  const { user, client } =
    await requireUser(request, context);

  const { data: profile, error: profileError } =
    await client.supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    throw new Response(
      "Unable to load your profile.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (!profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers }
    );
  }

  const { data: links, error } =
    await client.supabase
      .from("links")
      .select(
        "id,title,url,description,position,is_active"
      )
      .eq("profile_id", user.id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

  if (error) {
    throw new Response(
      "Unable to load your links.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  return data(
    {
      username: profile.username,
      links: (links ?? []) as CreatorLink[]
    },
    { headers: client.headers }
  );
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { user, client } =
    await requireUser(request, context);

  const form = await request.formData();

  const intent = String(form.get("intent") ?? "");
  const id = String(form.get("id") ?? "");

  function failure(
    message: string,
    status = 400
  ) {
    return data(
      { error: message },
      {
        status,
        headers: client.headers
      }
    );
  }

  if (
    intent !== "create" &&
    !UUID_REGEX.test(id)
  ) {
    return failure("Invalid link identifier.");
  }

  if (intent === "create" || intent === "update") {
    const validation =
      validateLinkInput(form);

    if (!validation.success) {
      return failure(validation.error);
    }

    if (intent === "create") {
      const { count, error: countError } =
        await client.supabase
          .from("links")
          .select("id", {
            count: "exact",
            head: true
          })
          .eq("profile_id", user.id);

      if (countError) {
        return failure("Unable to add link.", 503);
      }

      if ((count ?? 0) >= 100) {
        return failure(
          "Maximum 100 links per profile."
        );
      }

      const { data: lastLink, error: orderError } =
        await client.supabase
          .from("links")
          .select("position")
          .eq("profile_id", user.id)
          .order("position", {
            ascending: false
          })
          .limit(1)
          .maybeSingle();

      if (orderError) {
        return failure("Unable to add link.", 503);
      }

      const { error } =
        await client.supabase
          .from("links")
          .insert({
            profile_id: user.id,
            ...validation.value,
            position: (lastLink?.position ?? -1) + 1
          });

      if (error) {
        return failure(
          "Could not create link.",
          400
        );
      }
    } else {
      const { data: updated, error } =
        await client.supabase
          .from("links")
          .update(validation.value)
          .eq("id", id)
          .eq("profile_id", user.id)
          .select("id")
          .maybeSingle();

      if (error || !updated) {
        return failure(
          "Unable to update this link."
        );
      }
    }
  } else if (intent === "toggle") {
    const active =
      String(form.get("active")) === "true";

    const { data: updated, error } =
      await client.supabase
        .from("links")
        .update({
          is_active: active
        })
        .eq("id", id)
        .eq("profile_id", user.id)
        .select("id")
        .maybeSingle();

    if (error || !updated) {
      return failure(
        "Unable to change link visibility."
      );
    }
  } else if (intent === "delete") {
    const { data: removed, error } =
      await client.supabase
        .from("links")
        .delete()
        .eq("id", id)
        .eq("profile_id", user.id)
        .select("id")
        .maybeSingle();

    if (error || !removed) {
      return failure(
        "Unable to delete this link."
      );
    }
  } else if (intent === "move") {
    const direction = String(
      form.get("direction") ?? ""
    );

    if (
      direction !== "up" &&
      direction !== "down"
    ) {
      return failure(
        "Invalid move direction."
      );
    }

    const { data: current, error } =
      await client.supabase
        .from("links")
        .select("id")
        .eq("profile_id", user.id)
        .order("position")
        .order("created_at")
        .order("id");

    if (error || !current) {
      return failure("Unable to reorder links.", 503);
    }

    const ids = current.map((link) => link.id);
    const index = ids.indexOf(id);

    if (index === -1) {
      return failure("Link not found.", 404);
    }

    const nextIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      nextIndex >= 0 &&
      nextIndex < ids.length
    ) {
      const temp = ids[index];
      ids[index] = ids[nextIndex]!;
      ids[nextIndex] = temp!;

      const { error: reorderError } =
        await client.supabase.rpc(
          "reorder_my_links",
          { p_ids: ids }
        );

      if (reorderError) {
        return failure(
          "Could not save link order."
        );
      }
    }
  } else {
    return failure("Unknown action.");
  }

  throw redirect("/dashboard/links", {
    headers: client.headers
  });
}

export default function DashboardLinks() {
  const { username, links } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  return (
    <main className="studio-page">
      <header className="studio-header">
        <Link to="/" className="brand">
          HEYBIO
          <span className="brand-arrow">↗</span>
        </Link>

        <nav aria-label="Creator navigation">
          <Link to="/dashboard">
            Overview
          </Link>
          <Link
            to="/dashboard/links"
            aria-current="page"
          >
            Links
          </Link>
          <Link to="/dashboard/appearance">
            Appearance
          </Link>
        </nav>
      </header>

      <div className="studio-container">
        <div className="studio-page-heading">
          <span className="eyebrow">
            HEYBIO CREATOR STUDIO
          </span>

          <h1>Link Studio.</h1>
          <p>
            A beautiful place to organize
            everything that matters to you.
          </p>

          <Link
            className="studio-profile-shortcut"
            to={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View public profile ↗
          </Link>
        </div>

        <LinkEditor
          links={links}
          error={actionData?.error}
        />
      </div>
    </main>
  );
}

import { useState } from "react";

import {
  Link,
  data,
  useLoaderData,
} from "react-router";

import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  ArrowLeft,
  ExternalLink,
  Globe2,
  Info,
} from "lucide-react";

import SocialLinks, {
  SOCIAL_PLATFORMS,
  type CreatorSocialLink,
  type SocialPlatform,
} from "../../components/creator/SocialLinks";

import { requireUser } from "../../lib/auth/require-user.server";

export const meta: MetaFunction = () => [
  { title: "Social integrations — HEYBIO" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);

  const { data: socials, error } = await client.supabase
    .from("social_links")
    .select("id,platform,url,position,is_visible")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    throw new Response("Could not load your social links.", {
      status: 503,
      headers: client.headers,
    });
  }

  const links: CreatorSocialLink[] = (socials ?? [])
    .filter((link) =>
      SOCIAL_PLATFORMS.some(
        (platform) => platform === link.platform,
      ),
    )
    .map((link) => ({
      id: link.id,
      platform: link.platform as SocialPlatform,
      url: link.url,
      position: link.position,
      is_visible: link.is_visible,
    }));

  return data(
    { links },
    { headers: client.headers },
  );
}

export default function DashboardIntegrations() {
  const { links: initialLinks } = useLoaderData<typeof loader>();

  const [links, setLinks] =
    useState<CreatorSocialLink[]>(initialLinks);

  async function save(edited: CreatorSocialLink[]) {
    const response = await fetch("/api/social-links", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        links: edited.map(({
          platform,
          url,
          is_visible,
        }) => ({
          platform,
          url,
          is_visible,
        })),
      }),
    });

    const body: { ok?: boolean } = await response
      .json()
      .catch(() => ({}));

    if (!response.ok || !body.ok) {
      throw new Error("Social links could not be saved.");
    }

    setLinks(edited);
  }

  return (
    <main className="hb-workspace">
      <div className="hb-workspace__container hb-workspace__container--narrow">
        <Link
          className="hb-workspace__back"
          to="/dashboard"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Dashboard
        </Link>

        <header className="hb-workspace__heading">
          <div>
            <span className="hb-workspace__eyebrow">
              YOUR ONLINE PRESENCE
            </span>

            <h1>
              <Globe2 size={29} aria-hidden="true" />
              Social links
            </h1>

            <p>
              Connect your audience to your
              channels, portfolio and other destinations.
            </p>
          </div>
        </header>

        <div className="hb-workspace__note" role="note">
          <Info size={18} aria-hidden="true" />

          <span>
            These are saved HTTPS links, not OAuth
            connections or platform permissions.
            The public profile still needs its
            social-icon rendering integration;
            saving a link does not guarantee it
            appears publicly yet.
          </span>
        </div>

        <div
          style={{
            padding: "clamp(16px, 4vw, 28px)",
            background: "#FFF",
            borderRadius: 22,
            border: "1px solid #DEDEE3",
          }}
        >
          <SocialLinks
            links={links}
            onSave={save}
          />
        </div>

        <p
          className="hb-workspace__fine"
          style={{ marginTop: 24 }}
        >
          HEYBIO never asks for your Instagram,
          YouTube or other third-party passwords.
          Manage the content of your{" "}
          <Link to="/dashboard/links">
            main link buttons
          </Link>{" "}
          separately.
        </p>

        <a
          href="/dashboard/preview"
          className="hb-workspace__button"
          style={{ marginTop: 8 }}
        >
          Preview creator page
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
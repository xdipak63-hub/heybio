import {
  Form,
  data,
  redirect,
  useLoaderData,
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

export function meta() {
  return [
    { title: "Choose your plan — HEYBIO" },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    throw new Response(
      "Unable to load your profile.",
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

  return data(
    { username: profile.username },
    { headers: client.headers },
  );
}

export async function action({
  request,
  context,
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { user, client } =
    await requireUser(request, context);

  const form = await request.formData();
  const plan = String(form.get("plan") ?? "");

  if (plan !== "free") {
    return data(
      {
        error:
          "Paid checkout is not available yet.",
      },
      {
        status: 400,
        headers: client.headers,
      },
    );
  }

  const { data: profile, error } =
    await client.supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

  if (error || !profile?.username) {
    throw redirect(
      "/onboarding/choose-username",
      { headers: client.headers },
    );
  }

  // No subscription record is fabricated.
  // Free access is determined by server-side
  // entitlement defaults in the existing app.
  throw redirect("/dashboard", {
    headers: client.headers,
  });
}

export default function ChoosePlanPage() {
  const { username } =
    useLoaderData<typeof loader>();

  return (
    <main className="hb-plan-onboarding">
      <div className="hb-plan-onboarding__inner">
        <a href="/" className="hb-header__logo">
          HEYBIO<span>↗</span>
        </a>

        <div className="hb-plan-onboarding__progress">
          <span>YOUR CREATOR JOURNEY</span>
          <span>02 / 02</span>
        </div>

        <div className="hb-plan-onboarding__welcome">
          <span className="hb-pill">
            <Check size={16} />
            YOUR SPACE IS READY
          </span>

          <h1>
            Hello, @{username}.
            <br />
            <span>Let's make it yours.</span>
          </h1>

          <p>
            Your username has been claimed.
            Start creating for free, or explore
            what HEYBIO has planned for paid members.
          </p>
        </div>

        <div className="hb-plan-onboarding__choices">
          <article className="hb-choice hb-choice--free">
            <div className="hb-choice__top">
              <span>START HERE</span>
              <Sparkles size={24} />
            </div>

            <h2>Free forever to start.</h2>

            <p>
              Create your profile, add your links
              and share your space with the world.
            </p>

            <div className="hb-choice__price">
              ₹0 <span>/month</span>
            </div>

            <Form method="post">
              <input
                type="hidden"
                name="plan"
                value="free"
              />

              <button type="submit">
                Continue with Free
                <ArrowUpRight size={20} />
              </button>
            </Form>
          </article>

          <article className="hb-choice hb-choice--paid">
            <div className="hb-choice__top">
              <span>MORE POSSIBILITIES</span>
              <LockKeyhole size={24} />
            </div>

            <h2>Grow when you're ready.</h2>

            <p>
              Explore Pro, Premium and Pro Max.
              Paid checkout will become available
              after billing activation.
            </p>

            <a href="/pricing">
              Explore paid plans
              <ArrowUpRight size={20} />
            </a>
          </article>
        </div>

        <p className="hb-plan-onboarding__footnote">
          No credit card needed to create your HEYBIO.
        </p>
      </div>
    </main>
  );
}
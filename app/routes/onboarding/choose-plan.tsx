
import {
  Form,
  Link,
  data,
  redirect,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import CheckoutButton from "../../components/billing/CheckoutButton";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

import {
  requireSameOrigin,
} from "../../lib/supabase/server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import {
  getBillingAccess,
} from "../../lib/payments/subscriptions.server";

import {
  PLANS,
  type PlanId,
} from "../../lib/plans";

export const meta: MetaFunction = () => [
  { title: "Choose your plan — HEYBIO" },
  {
    name: "robots",
    content: "noindex, nofollow",
  },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const {
    data: profile,
    error,
  } = await client.supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Response(
      "Unable to load profile.",
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

  const admin = createSupabaseAdmin(
    getServerBindings(context),
  );

  const access = await getBillingAccess(
    admin,
    user.id,
  );

  return data(
    {
      username: profile.username,
      activePlan: access.active
        ? access.plan
        : null,
    },
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

  if (form.get("plan") !== "free") {
    return data(
      {
        error:
          "Paid plans require secure Razorpay checkout.",
      },
      {
        status: 400,
        headers: client.headers,
      },
    );
  }

  const {
    data: profile,
    error,
  } = await client.supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Response(
      "Unable to verify profile.",
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

  // Never downgrade an active subscription
  // through a free-plan form.
  const access = await getBillingAccess(
    createSupabaseAdmin(
      getServerBindings(context),
    ),
    user.id,
  );

  if (access.active) {
    throw redirect(
      "/onboarding/create-profile",
      { headers: client.headers },
    );
  }

  // Free is the server-verified fallback.
  // No fake payment is ever written.
  throw redirect(
    "/onboarding/create-profile",
    { headers: client.headers },
  );
}

const CARDS: Array<{
  id: PlanId;
  benefits: string[];
}> = [
  {
    id: "free",
    benefits: [
      "Public creator page",
      "Essential links",
      "HYPE DROP locked",
    ],
  },
  {
    id: "pro",
    benefits: [
      "Custom themes",
      "Advanced appearance",
      "HYPE DROP locked",
    ],
  },
  {
    id: "premium",
    benefits: [
      "Analytics",
      "Advanced appearance",
      "HYPE DROP included",
    ],
  },
  {
    id: "pro_max",
    benefits: [
      "Premium features",
      "Analytics",
      "HYPE DROP included",
    ],
  },
];

export default function ChoosePlanPage() {
  const {
    username,
    activePlan,
  } = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  const choosingFree =
    navigation.state !== "idle" &&
    navigation.formData?.get("plan") === "free";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "clamp(24px, 5vw, 72px) 20px",
        background: "#F5F5F7",
        color: "#1D1D1F",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{
            color: "inherit",
            textDecoration: "none",
            fontWeight: 850,
            fontSize: 23,
          }}
        >
          HEYBIO ↗
        </Link>

        <header
          style={{
            margin: "48px 0 32px",
            maxWidth: 720,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 750,
              letterSpacing: ".14em",
            }}
          >
            YOUR CREATOR JOURNEY
          </p>

          <h1
            style={{
              fontSize:
                "clamp(2.2rem, 5vw, 4.2rem)",
              letterSpacing: "-.055em",
              lineHeight: 1.08,
              margin: "12px 0",
            }}
          >
            Your world starts here.
          </h1>

          <p
            style={{
              lineHeight: 1.6,
              color: "#505157",
            }}
          >
            @{username} is yours. Choose a plan
            that works for you. You can create
            your HEYBIO for free and upgrade later.
          </p>
        </header>

        {activePlan && (
          <p
            role="status"
            style={{
              padding: 16,
              border: "1px solid #D5D5D9",
              borderRadius: 14,
              background: "white",
            }}
          >
            Your verified active plan is{" "}
            <strong>
              {PLANS[activePlan].name}
            </strong>
            .{" "}
            <Link to="/onboarding/create-profile">
              Continue building your page ↗
            </Link>
          </p>
        )}

        <section
          aria-label="Choose HEYBIO plan"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: 16,
          }}
        >
          {CARDS.map(({ id, benefits }) => {
            const plan = PLANS[id];

            return (
              <article
                key={id}
                style={{
                  background: "white",
                  border: plan.featured
                    ? "2px solid #1D1D1F"
                    : "1px solid #E4E4E8",
                  borderRadius: 20,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    minHeight: 28,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong>{plan.name}</strong>

                  {plan.featured && (
                    <span
                      style={{
                        background: "#BDF806",
                        padding: "4px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      POPULAR
                    </span>
                  )}
                </div>

                <div>
                  <strong
                    style={{
                      fontSize: 35,
                      letterSpacing: "-.05em",
                    }}
                  >
                    ₹{plan.monthlyPriceInr}
                  </strong>

                  <span
                    style={{
                      color: "#62636A",
                    }}
                  >
                    /month
                  </span>
                </div>

                <p
                  style={{
                    minHeight: 42,
                    margin: 0,
                    color: "#62636A",
                    lineHeight: 1.5,
                  }}
                >
                  {plan.description}
                </p>

                <ul
                  style={{
                    flex: 1,
                    paddingLeft: 19,
                    lineHeight: 1.9,
                    margin: 0,
                  }}
                >
                  {benefits.map((item) => (
                    <li key={item}>
                      {item}
                    </li>
                  ))}
                </ul>

                {id === "free" ? (
                  <Form method="post">
                    <input
                      type="hidden"
                      name="plan"
                      value="free"
                    />

                    <button
                      type="submit"
                      disabled={choosingFree}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        minHeight: 46,
                        border: 0,
                        borderRadius: 12,
                        background: "#BDF806",
                        color: "#1D1D1F",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {choosingFree
                        ? "Continuing…"
                        : "Continue free ↗"}
                    </button>
                  </Form>
                ) : activePlan ? (
                  <Link to="/dashboard/billing">
                    Manage subscription ↗
                  </Link>
                ) : (
                  <CheckoutButton
                    planId={id}
                    label={`Choose ${plan.name} ↗`}
                    onVerificationPending={() => {
                      // Activation is webhook-verified.
                    }}
                  />
                )}
              </article>
            );
          })}
        </section>

        <p
          style={{
            marginTop: 25,
            color: "#62636A",
            lineHeight: 1.6,
            fontSize: 14,
          }}
        >
          Paid plans require Razorpay authorization
          for monthly recurring billing. Payment
          does not instantly unlock features;
          secure server verification is required.
          Free and Pro do not include HYPE DROP.
        </p>

        <Link to="/onboarding/create-profile">
          Continue setting up your profile ↗
        </Link>
      </div>
    </main>
  );
}
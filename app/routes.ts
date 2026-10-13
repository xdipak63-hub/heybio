import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

import "./styles/app.css";
import "./styles/heybio-premium.css";

export default [
  // PUBLIC MARKETING

  index("routes/marketing/home.tsx"),

  route(
    "pricing",
    "routes/marketing/pricing.tsx",
  ),

  // AUTHENTICATION

  route(
    "signup",
    "routes/auth/signup.tsx",
  ),

  route(
    "login",
    "routes/auth/login.tsx",
  ),

  route(
    "auth/callback",
    "routes/auth/callback.tsx",
  ),

  route(
    "logout",
    "routes/auth/logout.tsx",
  ),

  route(
    "forgot-password",
    "routes/auth/forgot-password.tsx",
  ),

  route(
    "reset-password",
    "routes/auth/reset-password.tsx",
  ),

  route(
    "verify-email",
    "routes/auth/verify-email.tsx",
  ),

  // CREATOR ONBOARDING

  route(
    "onboarding/choose-username",
    "routes/onboarding/choose-username.tsx",
  ),

  route(
    "onboarding/choose-plan",
    "routes/onboarding/choose-plan.tsx",
  ),

  // CREATOR DASHBOARD

  route(
    "dashboard",
    "routes/dashboard/overview.tsx",
  ),

  route(
    "dashboard/links",
    "routes/dashboard/links.tsx",
  ),

  route(
    "dashboard/appearance",
    "routes/dashboard/appearance.tsx",
  ),

  // PUBLIC USERNAME AVAILABILITY

  route(
    "api/username-availability",
    "routes/api/username-availability.ts",
  ),

  // BILLING

  route(
    "api/checkout",
    "routes/api/checkout.ts",
  ),

  route(
    "api/subscription-cancel",
    "routes/api/subscription-cancel.ts",
  ),

  route(
    "api/razorpay-webhook",
    "routes/api/razorpay-webhook.ts",
  ),

  // HYPE DROP ENTITLEMENTS

  route(
    "api/hype-entitlement",
    "routes/api/hype-entitlement.ts",
  ),

  // SUPER ADMIN

  route(
    "api/admin-actions",
    "routes/api/admin-actions.ts",
  ),

  // PUBLIC CREATOR PROFILE
  // Keep this route last.

  route(
    ":username",
    "routes/public/profile.tsx",
  ),
] satisfies RouteConfig;
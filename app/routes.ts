
import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

import "./styles/creator-components.css";
import "./styles/ui-system.css";
export default [
  // Marketing
  index("routes/marketing/home.tsx"),


  route(
    "pricing",
    "routes/marketing/pricing.tsx",
  ),

  // Authentication
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

  // MFA
  route(
    "auth/mfa-setup",
    "routes/auth/mfa-setup.tsx",
  ),

  route(
    "auth/mfa-verify",
    "routes/auth/mfa-verify.tsx",
  ),

  // Creator onboarding
  route(
    "onboarding/choose-username",
    "routes/onboarding/choose-username.tsx",
  ),

  route(
    "onboarding/choose-plan",
    "routes/onboarding/choose-plan.tsx",
  ),

  route(
    "onboarding/create-profile",
    "routes/onboarding/create-profile.tsx",
  ),

  route(
    "onboarding/choose-template",
    "routes/onboarding/choose-template.tsx",
  ),

  route(
    "onboarding/complete",
    "routes/onboarding/complete.tsx",
  ),

  // Creator dashboard
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


  // Protected administration
  route(
    "admin",
    "routes/admin/layout.tsx",
    [
      index("routes/admin/overview.tsx")
    ]
  ),

  // API


  // API
 
 route(
  "api/social-links",
  "routes/api/social-links.ts",
),

route(
  "api/uploads",
  "routes/api/uploads.ts",
),
  route(
    "api/username-availability",
    "routes/api/username-availability.ts",
  ),

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

  route(
    "api/hype-entitlement",
    "routes/api/hype-entitlement.ts",
  ),

  route(
    "api/admin-actions",
    "routes/api/admin-actions.ts",
  ),

  // Public creator profile — must remain last
  route(
    ":username",
    "routes/public/profile.tsx",
  ),
] satisfies RouteConfig;
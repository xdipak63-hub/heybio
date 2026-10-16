
import {
  index,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

import "./styles/creator-components.css";
import "./styles/ui-system.css";
import "./styles/tokens.css";

export default [
  // Public marketing
  index("routes/marketing/home.tsx"),

  route(
    "pricing",
    "routes/marketing/pricing.tsx",
  ),
  route(
    "features",
    "routes/marketing/features.tsx",
  ),
  route(
    "explore",
    "routes/marketing/explore.tsx",
  ),
  route(
    "templates",
    "routes/marketing/templates.tsx",
  ),
  route(
    "whats-new",
    "routes/marketing/whats-new.tsx",
  ),
  route(
    "news",
    "routes/marketing/news.tsx",
  ),
  route(
    "about-heybio",
    "routes/marketing/about-heybio.tsx",
  ),
  route(
    "about-dipolabs",
    "routes/marketing/about-dipolabs.tsx",
  ),
  route(
    "our-story",
    "routes/marketing/our-story.tsx",
  ),
  route(
    "contact",
    "routes/marketing/contact.tsx",
  ),

  // Legal
  route(
    "terms",
    "routes/legal/terms.tsx",
  ),
  route(
    "privacy",
    "routes/legal/privacy.tsx",
  ),
  route(
    "cookies",
    "routes/legal/cookies.tsx",
  ),
  route(
    "community-guidelines",
    "routes/legal/community-guidelines.tsx",
  ),
  route(
    "refund-policy",
    "routes/legal/refund-policy.tsx",
  ),
  route(
    "cancellation-policy",
    "routes/legal/cancellation-policy.tsx",
  ),

  // Support
  route(
    "support/help-center",
    "routes/support/help-center.tsx",
  ),
  route(
    "support/faqs",
    "routes/support/faqs.tsx",
  ),
  route(
    "support/getting-started",
    "routes/support/getting-started.tsx",
  ),
  route(
    "support/report-problem",
    "routes/support/report-problem.tsx",
  ),
  route(
    "support/submit-ticket",
    "routes/support/submit-ticket.tsx",
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

  // Creator workspace
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
  route(
    "dashboard/preview",
    "routes/dashboard/preview.tsx",
  ),
  route(
    "dashboard/share",
    "routes/dashboard/share.tsx",
  ),
  route(
    "dashboard/more",
    "routes/dashboard/more.tsx",
  ),
  route(
    "dashboard/billing",
    "routes/dashboard/billing.tsx",
  ),
  route(
    "dashboard/payment-history",
    "routes/dashboard/payment-history.tsx",
  ),
  route(
    "dashboard/hype-drop",
    "routes/dashboard/hype-drop.tsx",
  ),
  route(
    "dashboard/security",
    "routes/dashboard/security.tsx",
  ),
  route(
    "dashboard/settings",
    "routes/dashboard/settings.tsx",
  ),
  route(
    "dashboard/integrations",
    "routes/dashboard/integrations.tsx",
  ),
  route(
    "dashboard/analytics",
    "routes/dashboard/insights.tsx",
  ),
  route(
    "dashboard/audience",
    "routes/dashboard/audience.tsx",
  ),

  // Super Admin
  // Parent verifies identity, active role and MFA.
  // Children independently enforce permissions.
  route(
    "admin",
    "routes/admin/layout.tsx",
    [
      index("routes/admin/overview.tsx"),

      route(
        "users",
        "routes/admin/users.tsx",
      ),
      route(
        "users/:userId",
        "routes/admin/user-detail.tsx",
      ),
      route(
        "profiles",
        "routes/admin/profiles.tsx",
      ),
      route(
        "subscriptions",
        "routes/admin/subscriptions.tsx",
      ),
      route(
        "payments",
        "routes/admin/payments.tsx",
      ),
      route(
        "revenue",
        "routes/admin/revenue.tsx",
      ),
      route(
        "audit-logs",
        "routes/admin/audit-logs.tsx",
      ),
    ],
  ),

  // APIs
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
  route(
    "api/support-ticket",
    "routes/api/support-ticket.ts",
  ),
  route(
    "api/analytics",
    "routes/api/analytics.ts",
  ),

  // Public creator profile
  route(
    ":username",
    "routes/public/profile.tsx",
  ),
] satisfies RouteConfig;
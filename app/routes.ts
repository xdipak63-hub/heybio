
import {
  index,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  // Marketing
  index("routes/marketing/home.tsx"),
  route("pricing", "routes/marketing/pricing.tsx"),
  route("features", "routes/marketing/features.tsx"),
  route("explore", "routes/marketing/explore.tsx"),
  route("templates", "routes/marketing/templates.tsx"),
  route("whats-new", "routes/marketing/whats-new.tsx"),
  route("news", "routes/marketing/news.tsx"),
  route("about-heybio", "routes/marketing/about-heybio.tsx"),
  route("about-dipolabs", "routes/marketing/about-dipolabs.tsx"),
  route("our-story", "routes/marketing/our-story.tsx"),
  route("contact", "routes/marketing/contact.tsx"),

  // Legal
  route("terms", "routes/legal/terms.tsx"),
  route("privacy", "routes/legal/privacy.tsx"),
  route("cookies", "routes/legal/cookies.tsx"),
  route(
    "community-guidelines",
    "routes/legal/community-guidelines.tsx",
  ),
  route("refund-policy", "routes/legal/refund-policy.tsx"),
  route(
    "cancellation-policy",
    "routes/legal/cancellation-policy.tsx",
  ),

  // Support
  route(
    "support/help-center",
    "routes/support/help-center.tsx",
  ),
  route("support/faqs", "routes/support/faqs.tsx"),
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

  // Auth
  route("signup", "routes/auth/signup.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("auth/callback", "routes/auth/callback.tsx"),
  route("logout", "routes/auth/logout.tsx"),
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
  route("auth/mfa-setup", "routes/auth/mfa-setup.tsx"),
  route(
    "auth/mfa-verify",
    "routes/auth/mfa-verify.tsx",
  ),

  // Onboarding
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

  // Protected creator workspace
  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/overview.tsx"),
    route("links", "routes/dashboard/links.tsx"),
    route(
      "appearance",
      "routes/dashboard/appearance.tsx",
    ),
    route("preview", "routes/dashboard/preview.tsx"),
    route("share", "routes/dashboard/share.tsx"),
    route("more", "routes/dashboard/more.tsx"),
    route("billing", "routes/dashboard/billing.tsx"),
    route(
      "payment-history",
      "routes/dashboard/payment-history.tsx",
    ),
    route(
      "hype-drop",
      "routes/dashboard/hype-drop.tsx",
    ),
    route("security", "routes/dashboard/security.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
    route(
      "integrations",
      "routes/dashboard/integrations.tsx",
    ),
    route(
      "analytics",
      "routes/dashboard/insights.tsx",
    ),
    route(
      "audience",
      "routes/dashboard/audience.tsx",
    ),
  ]),

  // Super admin
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/overview.tsx"),
    route("users", "routes/admin/users.tsx"),
    route(
      "users/:userId",
      "routes/admin/user-detail.tsx",
    ),
    route("profiles", "routes/admin/profiles.tsx"),
    route(
      "subscriptions",
      "routes/admin/subscriptions.tsx",
    ),
    route("payments", "routes/admin/payments.tsx"),
    route("revenue", "routes/admin/revenue.tsx"),
    route(
      "audit-logs",
      "routes/admin/audit-logs.tsx",
    ),
    route("reports", "routes/admin/reports.tsx"),
    route("refunds", "routes/admin/refunds.tsx"),
    route(
      "hype-access",
      "routes/admin/hype-access.tsx",
    ),
    route("support", "routes/admin/support.tsx"),
    route("security", "routes/admin/security.tsx"),
    route("settings", "routes/admin/settings.tsx"),
  ]),

  // Creator and billing APIs
  route(
    "api/social-links",
    "routes/api/social-links.ts",
  ),
  route("api/uploads", "routes/api/uploads.ts"),
  route("api/profile", "routes/api/profile.ts"),
  route("api/links", "routes/api/links.ts"),
  route(
    "api/billing-portal",
    "routes/api/billing-portal.ts",
  ),
  route(
    "api/username-availability",
    "routes/api/username-availability.ts",
  ),
  route("api/checkout", "routes/api/checkout.ts"),
  route("api/payment-verify", "routes/api/payment-verify.ts"),
  route("api/billing-status", "routes/api/billing-status.ts"),
  route("api/billing-change", "routes/api/billing-change.ts"),
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

  // Public creator avatar delivery
  route(
    "api/public-avatar/:username",
    "routes/api/public-avatar.ts",
  ),

  // Keep public profiles last
  route(":username", "routes/public/profile.tsx"),
] satisfies RouteConfig;
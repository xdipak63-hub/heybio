import {
  type RouteConfig,
  index,
  route
} from "@react-router/dev/routes";

export default [
  // ========================================
  // HEYBIO | PUBLIC MARKETING
  // ========================================

  index(
    "routes/marketing/home.tsx"
  ),

  // ========================================
  // AUTHENTICATION
  // ========================================

  route(
    "signup",
    "routes/auth/signup.tsx"
  ),

  route(
    "login",
    "routes/auth/login.tsx"
  ),

  route(
    "auth/callback",
    "routes/auth/callback.tsx"
  ),

  route(
    "logout",
    "routes/auth/logout.tsx"
  ),

  // ========================================
  // CREATOR ONBOARDING
  // ========================================

  route(
    "onboarding/choose-username",
    "routes/onboarding/choose-username.tsx"
  ),

  // ========================================
  // CREATOR DASHBOARD
  // ========================================

  route(
    "dashboard",
    "routes/dashboard/overview.tsx"
  ),

  route(
    "dashboard/links",
    "routes/dashboard/links.tsx"
  ),

  route(
    "dashboard/appearance",
    "routes/dashboard/appearance.tsx"
  ),

  // ========================================
  // BILLING API
  // ========================================

  route(
    "api/checkout",
    "routes/api/checkout.ts"
  ),

  route(
    "api/subscription-cancel",
    "routes/api/subscription-cancel.ts"
  ),

  route(
    "api/razorpay-webhook",
    "routes/api/razorpay-webhook.ts"
  ),

  // ========================================
  // HYPE DROP
  // ========================================

  route(
    "api/hype-entitlement",
    "routes/api/hype-entitlement.ts"
  ),

  // ========================================
  // SUPER ADMIN API
  // ========================================

  route(
    "api/admin-actions",
    "routes/api/admin-actions.ts"
  ),

  // ========================================
  // PUBLIC CREATOR PROFILE
  // This route must stay last.
  // ========================================

  route(
    ":username",
    "routes/public/profile.tsx"
  )
] satisfies RouteConfig;

import {
  type RouteConfig,
  index,
  route
} from "@react-router/dev/routes";

export default [
  // MARKETING
  index("routes/marketing/home.tsx"),

  // AUTHENTICATION
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

  // ONBOARDING
  route(
    "onboarding/choose-username",
    "routes/onboarding/choose-username.tsx"
  ),

  // CREATOR DASHBOARD
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

  // PUBLIC PROFILES
  // Keep this after all fixed paths.
  route(
    ":username",
    "routes/public/profile.tsx"
  )
] satisfies RouteConfig;
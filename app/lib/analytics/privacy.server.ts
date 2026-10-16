
import { isbot } from "isbot";

export type AnalyticsEventKind =
  | "profile_view"
  | "link_click";

export type DeviceCategory =
  | "mobile"
  | "tablet"
  | "desktop"
  | "unknown";

export interface IncomingAnalyticsEvent {
  event: AnalyticsEventKind;
  username: string;
  linkId: string | null;
}

const USERNAME = /^[a-z][a-z0-9_]{2,29}$/;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Parse exactly the fields HEYBIO needs.
 *
 * Never accept a browser-supplied profile_id,
 * user_id, IP, destination URL, or metric count.
 */
export function parseAnalyticsEvent(
  value: unknown,
): IncomingAnalyticsEvent | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const row = value as Record<string, unknown>;

  if (
    Object.keys(row).some(
      (key) =>
        !["event", "username", "linkId"].includes(key),
    )
  ) {
    return null;
  }

  if (
    row.event !== "profile_view" &&
    row.event !== "link_click"
  ) {
    return null;
  }

  if (
    typeof row.username !== "string" ||
    !USERNAME.test(row.username)
  ) {
    return null;
  }

  if (row.event === "profile_view") {
    if (
      row.linkId !== undefined &&
      row.linkId !== null
    ) {
      return null;
    }

    return {
      event: "profile_view",
      username: row.username,
      linkId: null,
    };
  }

  if (
    typeof row.linkId !== "string" ||
    !UUID.test(row.linkId)
  ) {
    return null;
  }

  return {
    event: "link_click",
    username: row.username,
    linkId: row.linkId,
  };
}

/**
 * Store only a coarse device category.
 *
 * Full user-agent strings, visitor identifiers,
 * and IP addresses never enter the event row.
 */
export function deviceCategory(
  request: Request,
): DeviceCategory {
  const ua = (
    request.headers.get("user-agent") ?? ""
  ).slice(0, 600);

  if (/ipad|tablet|kindle|silk/i.test(ua)) {
    return "tablet";
  }

  if (
    /iphone|ipod|android.+mobile|mobile/i.test(ua)
  ) {
    return "mobile";
  }

  if (/android/i.test(ua)) {
    return "tablet";
  }

  return ua ? "desktop" : "unknown";
}

/**
 * Respect GPC / DNT and skip known crawlers.
 * Bot detection is best-effort, not a substitute
 * for Cloudflare edge rate limiting.
 */
export function shouldSkipAnalytics(
  request: Request,
): boolean {
  if (
    request.headers.get("sec-gpc") === "1" ||
    request.headers.get("dnt") === "1"
  ) {
    return true;
  }

  const ua =
    request.headers.get("user-agent") ?? "";

  if (!ua || isbot(ua)) {
    return true;
  }

  const fetchSite =
    request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "none"
  ) {
    return true;
  }

  return false;
}

/**
 * Product privacy policy constants.
 *
 * Retention is a target only. Implement an
 * actual scheduled deletion job before launch.
 *
 * Browser consent is checked by ProfilePreview.
 * The server cannot independently authenticate
 * a visitor's localStorage consent choice.
 */
export const ANALYTICS_PRIVACY_RULES =
  Object.freeze({
    storesIpAddress: false,
    storesUserAgent: false,
    storesVisitorIdentifier: false,
    storesReferrer: false,
    defaultOptIn: false,
    recommendedRetentionDays: 90,
  });
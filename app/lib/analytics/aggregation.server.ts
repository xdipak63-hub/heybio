
import type {
  SupabaseClient,
} from "@supabase/supabase-js";

export type AnalyticsPeriod = 7 | 30;

export type EventType =
  | "profile_view"
  | "link_click";

export type Device =
  | "mobile"
  | "desktop"
  | "tablet"
  | "unknown";

export interface AnalyticsBucket {
  label: string;
  from: string;
  to: string;
  views: number;
  clicks: number;
}

export interface AnalyticsSummary {
  days: AnalyticsPeriod;
  timezone: "UTC";
  views: number;
  clicks: number;
  clickRate: number | null;
  buckets: AnalyticsBucket[];
  devices: {
    category: Device;
    count: number;
  }[];
  measuredFrom: string;
  measuredUntil: string;
}

/**
 * Exact COUNT avoids silently reporting only
 * the first 1,000 rows as the total.
 *
 * Pass only the authenticated creator's ID.
 * Supabase RLS provides an additional boundary.
 */
async function eventCount(
  db: SupabaseClient,
  profileId: string,
  event: EventType,
  from: string,
  to: string,
  device?: Device,
): Promise<number> {
  let query = db
    .from("analytics_events")
    .select("id", {
      head: true,
      count: "exact",
    })
    .eq("profile_id", profileId)
    .eq("event_type", event)
    .gte("occurred_at", from)
    .lt("occurred_at", to);

  if (device) {
    query = query.eq(
      "device_category",
      device,
    );
  }

  const result = await query;

  if (
    result.error ||
    result.count === null
  ) {
    throw new Error(
      "Analytics aggregation failed",
    );
  }

  return result.count;
}

function addUtcDays(
  date: Date,
  days: number,
): Date {
  return new Date(
    date.getTime() + days * 86_400_000,
  );
}

/**
 * 7 days: daily buckets.
 * 30 days: 5-day buckets.
 *
 * This uses exact COUNT queries rather than
 * downloading raw visitor-level event rows.
 */
export async function aggregateCreatorAnalytics(
  db: SupabaseClient,
  profileId: string,
  days: AnalyticsPeriod,
  now = new Date(),
): Promise<AnalyticsSummary> {
  if (
    days !== 7 &&
    days !== 30
  ) {
    throw new Error(
      "Invalid analytics period",
    );
  }

  if (Number.isNaN(now.getTime())) {
    throw new Error(
      "Invalid current time",
    );
  }

  const tomorrow = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
    ),
  );

  const start =
    addUtcDays(tomorrow, -days);

  const from = start.toISOString();
  const to = tomorrow.toISOString();

  const bucketSize =
    days === 7 ? 1 : 5;

  const spans = Array.from(
    {
      length: days / bucketSize,
    },
    (_, i) => {
      const begin =
        addUtcDays(
          start,
          i * bucketSize,
        );

      const end =
        addUtcDays(
          begin,
          bucketSize,
        );

      return {
        from: begin.toISOString(),
        to: end.toISOString(),
      };
    },
  );

  const [
    views,
    clicks,
    buckets,
    devices,
  ] = await Promise.all([
    eventCount(
      db,
      profileId,
      "profile_view",
      from,
      to,
    ),

    eventCount(
      db,
      profileId,
      "link_click",
      from,
      to,
    ),

    Promise.all(
      spans.map(async (span) => {
        const [
          bucketViews,
          bucketClicks,
        ] = await Promise.all([
          eventCount(
            db,
            profileId,
            "profile_view",
            span.from,
            span.to,
          ),

          eventCount(
            db,
            profileId,
            "link_click",
            span.from,
            span.to,
          ),
        ]);

        return {
          label:
            new Intl.DateTimeFormat(
              "en-GB",
              {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              },
            ).format(
              new Date(span.from),
            ),

          ...span,
          views: bucketViews,
          clicks: bucketClicks,
        };
      }),
    ),

    Promise.all(
      (
        [
          "mobile",
          "desktop",
          "tablet",
          "unknown",
        ] as const
      ).map(
        async (category) => ({
          category,
          count:
            await eventCount(
              db,
              profileId,
              "profile_view",
              from,
              to,
              category,
            ),
        }),
      ),
    ),
  ]);

  return {
    days,
    timezone: "UTC",
    views,
    clicks,

    clickRate:
      views > 0
        ? Number(
            (
              (clicks / views) *
              100
            ).toFixed(1),
          )
        : null,

    buckets,
    devices,
    measuredFrom: from,
    measuredUntil: to,
  };
}
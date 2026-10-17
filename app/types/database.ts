/**
 * HEYBIO ↗ Public schema snapshot from migrations 001–026.
 * Regenerate against your real Supabase database after applying all migrations.
 * This file is for TypeScript only; permissions MUST be enforced by PostgreSQL RLS.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Insert enforces fields without SQL defaults; update accepts partial rows. */
type Table<Row extends Record<string, unknown>, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string; username: string | null; display_name: string;
        bio: string; avatar_path: string | null; account_status: string;
        created_at: string; updated_at: string;
      }, "id">;
      usernames: Table<{
        user_id: string; username: string; created_at: string;
      }, "user_id" | "username">;
      reserved_usernames: Table<{
        username: string;
      }, "username">;
      links: Table<{
        id: string; profile_id: string; title: string;
        url: string; description: string; position: number;
        is_active: boolean; created_at: string; updated_at: string;
      }, "profile_id" | "title" | "url">;
      social_links: Table<{
        id: string; user_id: string; platform: string;
        url: string; position: number; is_visible: boolean;
        created_at: string;
      }, "user_id" | "platform" | "url">;
      profile_media: Table<{
        id: string; user_id: string; storage_path: string;
        media_type: string; mime_type: string; byte_size: number;
        alt_text: string; position: number; created_at: string;
      }, "user_id" | "storage_path" | "media_type" | "mime_type" | "byte_size">;
      profile_themes: Table<{
        profile_id: string; preset: string; accent: string;
        button_style: string; updated_at: string;
      }, "profile_id">;
      plans: Table<{
        id: string; name: string; description: string;
        price_paise: number; currency: string; billing_interval: string | null;
        tier_rank: number; razorpay_plan_id: string | null; is_active: boolean;
        created_at: string; updated_at: string;
      }, "id" | "name" | "price_paise" | "tier_rank">;
      subscriptions: Table<{
        id: string; user_id: string; plan_id: string;
        razorpay_subscription_id: string | null; razorpay_plan_id: string | null; status: string;
        current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean;
        cancelled_at: string | null; ended_at: string | null; created_at: string;
        updated_at: string;
      }, "user_id" | "plan_id">;
      payments: Table<{
        id: string; user_id: string; subscription_id: string | null;
        razorpay_payment_id: string; razorpay_order_id: string | null; amount_paise: number;
        amount_refunded_paise: number; currency: string; status: string;
        method: string | null; captured_at: string | null; created_at: string;
        updated_at: string;
      }, "user_id" | "razorpay_payment_id" | "amount_paise" | "status">;
      webhook_events: Table<{
        id: string; provider: string; provider_event_id: string;
        event_type: string; payload: Json; processing_status: string;
        attempt_count: number; received_at: string; processed_at: string | null;
        last_attempt_at: string | null; error_message: string | null;
      }, "provider_event_id" | "event_type" | "payload">;
      entitlements: Table<{
        id: string; user_id: string; subscription_id: string | null;
        feature_key: string; starts_at: string; expires_at: string | null;
        revoked_at: string | null; created_at: string;
      }, "user_id" | "feature_key">;
      analytics_events: Table<{
        id: string; profile_id: string; link_id: string | null;
        event_type: string; occurred_at: string; referrer_domain: string | null;
        country_code: string | null; device_category: string | null;
      }, "profile_id" | "event_type">;
      admin_roles: Table<{
        user_id: string; role: string; is_active: boolean;
        granted_at: string; granted_by: string | null;
      }, "user_id">;
      admin_audit_logs: Table<{
        id: string; actor_user_id: string; action: string;
        target_type: string; target_id: string | null; metadata: Json;
        created_at: string;
      }, "actor_user_id" | "action" | "target_type">;
      user_moderation: Table<{
        id: string; user_id: string; admin_user_id: string;
        action: string; reason: string; created_at: string;
      }, "user_id" | "admin_user_id" | "action" | "reason">;
      support_tickets: Table<{
        id: string; user_id: string; subject: string;
        message: string; category: string; priority: string;
        status: string; assigned_admin_id: string | null; created_at: string;
        updated_at: string; resolved_at: string | null;
      }, "user_id" | "subject" | "message">;
      notifications: Table<{
        id: string; user_id: string; category: string;
        title: string; message: string; read_at: string | null;
        created_at: string;
      }, "user_id" | "category" | "title" | "message">;
      razorpay_event_inbox: Table<{
        id: string; provider_event_id: string; event_type: string;
        payload: Json; status: string; attempts: number;
        next_attempt_at: string; last_error: string | null; received_at: string;
        processed_at: string | null; locked_until: string | null; lease_token: string | null;
      }, "provider_event_id" | "event_type" | "payload">;
      billing_reconciliation_log: Table<{
        id: string; subscription_id: string | null; razorpay_subscription_id: string;
        provider_status: string; result: string; details: Json;
        checked_at: string;
      }, "razorpay_subscription_id" | "provider_status" | "result">;
    };
    Views: { [_ in never]: never };
    Functions: {
      get_public_profile: { Args: { p_username: string }; Returns: Json };
      reorder_my_links: { Args: { p_ids: string[] }; Returns: void };
      save_my_social_links: { Args: { p_links: Json }; Returns: void };
      enqueue_razorpay_event: {
        Args: { p_event_id: string; p_event_type: string; p_payload: Json };
        Returns: Json;
      };
      claim_razorpay_events: {
        Args: { p_limit?: number };
        Returns: Array<{
          id: string; lease_token: string; provider_event_id: string;
          event_type: string; payload: Json; attempts: number;
        }>;
      };
      finish_razorpay_event: {
        Args: { p_id: string; p_lease_token: string; p_success: boolean; p_error?: string | null };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name]["Row"];
export type TablesInsert<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name]["Insert"];
export type TablesUpdate<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name]["Update"];

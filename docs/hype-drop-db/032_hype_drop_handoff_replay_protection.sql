
-- ============================================================
-- HYPE DROP by DIPO LABS
-- Migration 001: One-Time SSO Handoff Replay Protection
--
-- IMPORTANT:
-- Run in the SEPARATE HYPE DROP Supabase project.
-- Do not run in the HEYBIO database.
--
-- This database function does NOT verify JWT signatures.
-- The trusted HYPE DROP backend MUST first validate:
--   HS256 signature, issuer, audience, expiry,
--   nbf, iat, plan, sub and jti.
--
-- Only then call the atomic consume function.
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;

GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.handoff_consumptions (
    jti UUID PRIMARY KEY,

    heybio_user_id UUID NOT NULL,

    plan TEXT NOT NULL
        CHECK (plan IN ('premium', 'pro_max')),

    token_issued_at TIMESTAMPTZ NOT NULL,

    token_expires_at TIMESTAMPTZ NOT NULL,

    consumed_at TIMESTAMPTZ NOT NULL
        DEFAULT clock_timestamp(),

    CONSTRAINT valid_handoff_period
        CHECK (
            token_expires_at > token_issued_at
            AND token_expires_at
                <= token_issued_at + INTERVAL '90 seconds'
        )
);

ALTER TABLE private.handoff_consumptions
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE private.handoff_consumptions
    FORCE ROW LEVEL SECURITY;

REVOKE ALL
ON private.handoff_consumptions
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT
ON private.handoff_consumptions
TO service_role;

CREATE INDEX IF NOT EXISTS
    idx_handoff_consumptions_expires
ON private.handoff_consumptions (
    token_expires_at
);

-- Atomically consumes a previously verified token.
--
-- Returns TRUE only for the first valid consumption.
-- Returns FALSE for expired, invalid or reused tokens.
--
-- Security:
-- - no client-side execution
-- - unique jti constraint prevents concurrent replay
-- - database clock is authoritative
-- - no DELETE of used jti before token expiry
-- - no arbitrary SQL execution

CREATE OR REPLACE FUNCTION
private.consume_heybio_handoff(
    p_jti UUID,
    p_heybio_user_id UUID,
    p_plan TEXT,
    p_issued_at TIMESTAMPTZ,
    p_not_before TIMESTAMPTZ,
    p_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_now TIMESTAMPTZ;
    v_inserted UUID;
BEGIN
    v_now := clock_timestamp();

    IF p_jti IS NULL
        OR p_heybio_user_id IS NULL
        OR p_plan IS NULL
        OR p_issued_at IS NULL
        OR p_not_before IS NULL
        OR p_expires_at IS NULL
    THEN
        RETURN FALSE;
    END IF;

    IF p_plan NOT IN ('premium', 'pro_max') THEN
        RETURN FALSE;
    END IF;

    IF p_issued_at > v_now + INTERVAL '30 seconds'
        OR p_not_before > v_now + INTERVAL '30 seconds'
        OR p_expires_at <= v_now
        OR p_expires_at <= p_issued_at
        OR p_expires_at >
            p_issued_at + INTERVAL '90 seconds'
    THEN
        RETURN FALSE;
    END IF;

    INSERT INTO private.handoff_consumptions (
        jti,
        heybio_user_id,
        plan,
        token_issued_at,
        token_expires_at
    )
    VALUES (
        p_jti,
        p_heybio_user_id,
        p_plan,
        p_issued_at,
        p_expires_at
    )
    ON CONFLICT (jti) DO NOTHING
    RETURNING jti INTO v_inserted;

    RETURN v_inserted IS NOT NULL;
END;
$function$;

REVOKE ALL
ON FUNCTION private.consume_heybio_handoff(
    UUID,
    UUID,
    TEXT,
    TIMESTAMPTZ,
    TIMESTAMPTZ,
    TIMESTAMPTZ
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION private.consume_heybio_handoff(
    UUID,
    UUID,
    TEXT,
    TIMESTAMPTZ,
    TIMESTAMPTZ,
    TIMESTAMPTZ
)
TO service_role;

-- Cleanup must remove only records whose token
-- expiry is already safely in the past.
--
-- This function is restricted to the trusted
-- backend and must be invoked periodically.

CREATE OR REPLACE FUNCTION
private.cleanup_expired_handoffs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM private.handoff_consumptions
    WHERE token_expires_at
        < clock_timestamp() - INTERVAL '5 minutes';

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RETURN v_deleted;
END;
$function$;

REVOKE ALL
ON FUNCTION private.cleanup_expired_handoffs()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION private.cleanup_expired_handoffs()
TO service_role;

COMMIT;

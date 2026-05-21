-- ════════════════════════════════════════════════════════════════
-- ArjunaFit — Fix app_events 400 + app_errors 401
-- deep-observability-console-clean-v1
-- EXECUTE IN: Supabase SQL Editor → Run All
-- ════════════════════════════════════════════════════════════════

-- ── Create tables if they don't exist ────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id    text NULL,
  event_name    text NOT NULL,
  event_context text NULL,
  route         text NULL,
  product_type  text NULL,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  app_version   text NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_errors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  route         text NULL,
  error_message text NOT NULL,
  error_stack   text NULL,
  severity      text DEFAULT 'error',
  product_type  text NULL,
  app_version   text NULL,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  resolved      boolean DEFAULT false,
  resolved_at   timestamptz NULL,
  created_at    timestamptz DEFAULT now()
);


-- ── app_events: add missing columns if table already exists ──────
ALTER TABLE public.app_events ADD COLUMN IF NOT EXISTS session_id    text;
ALTER TABLE public.app_events ADD COLUMN IF NOT EXISTS event_context text;
ALTER TABLE public.app_events ADD COLUMN IF NOT EXISTS route         text;
ALTER TABLE public.app_events ADD COLUMN IF NOT EXISTS app_version   text;

-- ── app_events: drop all old policies, recreate ───────────────────
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_user_insert"                          ON public.app_events;
DROP POLICY IF EXISTS "events_admin_read"                           ON public.app_events;
DROP POLICY IF EXISTS "events_insert_open"                          ON public.app_events;
DROP POLICY IF EXISTS "events_auth_insert"                          ON public.app_events;
DROP POLICY IF EXISTS "events_anon_insert"                          ON public.app_events;
DROP POLICY IF EXISTS "app_events_insert_own"                       ON public.app_events;
DROP POLICY IF EXISTS "app_events_insert_anon"                      ON public.app_events;
DROP POLICY IF EXISTS "app_events_admin_read"                       ON public.app_events;
DROP POLICY IF EXISTS "Users can insert own app events"             ON public.app_events;
DROP POLICY IF EXISTS "Anonymous can insert anonymous app events"   ON public.app_events;
DROP POLICY IF EXISTS "Anon can insert anonymous app events"        ON public.app_events;
DROP POLICY IF EXISTS "Admins can read all app events"              ON public.app_events;

CREATE POLICY "events_auth_insert" ON public.app_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "events_anon_insert" ON public.app_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "events_admin_read" ON public.app_events
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- ── app_errors: drop all old policies, recreate ──────────────────
ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_errors_user_insert"                      ON public.app_errors;
DROP POLICY IF EXISTS "app_errors_admin_read"                       ON public.app_errors;
DROP POLICY IF EXISTS "errors_auth_insert"                          ON public.app_errors;
DROP POLICY IF EXISTS "errors_anon_insert"                          ON public.app_errors;
DROP POLICY IF EXISTS "errors_admin_read"                           ON public.app_errors;
DROP POLICY IF EXISTS "app_errors_insert_own"                       ON public.app_errors;
DROP POLICY IF EXISTS "app_errors_insert_anon"                      ON public.app_errors;
DROP POLICY IF EXISTS "app_errors_admin_read"                       ON public.app_errors;
DROP POLICY IF EXISTS "Users can insert own app errors"             ON public.app_errors;
DROP POLICY IF EXISTS "Anonymous can insert anonymous app errors"   ON public.app_errors;
DROP POLICY IF EXISTS "Admins can read all app errors"              ON public.app_errors;

CREATE POLICY "errors_auth_insert" ON public.app_errors
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "errors_anon_insert" ON public.app_errors
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "errors_admin_read" ON public.app_errors
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- ── Verificación ─────────────────────────────────────────────────
SELECT tablename, policyname, cmd,
  CASE WHEN roles @> ARRAY['authenticated'::name] THEN 'authenticated' ELSE 'anon' END as role_type
FROM pg_policies
WHERE tablename IN ('app_events', 'app_errors')
ORDER BY tablename, cmd;

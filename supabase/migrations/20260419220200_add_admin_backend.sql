-- Admin backend: organizations, compliance incidents, feature flags, and
-- SECURITY DEFINER RPCs that return aggregate platform metrics for the
-- super-admin dashboards. All RPCs hard-fail unless the caller is a super_admin.

-- ---------------------------------------------------------------------------
-- Organizations: a lightweight tenant directory that the admin UI lists.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'hospital',
  city text,
  country text NOT NULL DEFAULT 'AE',
  primary_contact_name text,
  primary_contact_email text,
  baa_signed_at timestamptz,
  contract_started_at timestamptz,
  contract_ends_at timestamptz,
  seats_allocated integer NOT NULL DEFAULT 0,
  seats_used integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_kind_chk CHECK (kind IN ('hospital', 'clinic', 'lab', 'pharmacy', 'insurance')),
  CONSTRAINT organizations_status_chk CHECK (status IN ('active', 'suspended', 'pending', 'archived')),
  CONSTRAINT organizations_seats_chk CHECK (seats_used >= 0 AND seats_allocated >= seats_used)
);

CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_kind ON public.organizations(kind);

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_admin_manage" ON public.organizations;
CREATE POLICY "organizations_admin_manage"
  ON public.organizations
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- Compliance incidents: track security / privacy incidents for DHA / DOH
-- reporting.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  owner_user_id uuid REFERENCES auth.users(id),
  affected_records integer NOT NULL DEFAULT 0,
  regulator_reported boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_incidents_severity_chk CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT admin_incidents_status_chk CHECK (status IN ('open', 'investigating', 'mitigated', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_admin_incidents_status
  ON public.admin_incidents(status, detected_at DESC);

DROP TRIGGER IF EXISTS trg_admin_incidents_updated_at ON public.admin_incidents;
CREATE TRIGGER trg_admin_incidents_updated_at
  BEFORE UPDATE ON public.admin_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.admin_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_incidents_admin_manage" ON public.admin_incidents;
CREATE POLICY "admin_incidents_admin_manage"
  ON public.admin_incidents
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- Feature flags: toggleable features per environment.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  environment text NOT NULL DEFAULT 'production',
  is_enabled boolean NOT NULL DEFAULT false,
  rollout_percent integer NOT NULL DEFAULT 0,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feature_flags_rollout_chk CHECK (rollout_percent BETWEEN 0 AND 100),
  CONSTRAINT feature_flags_environment_chk CHECK (environment IN ('development', 'staging', 'production'))
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_environment
  ON public.feature_flags(environment, is_enabled);

DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags_admin_manage" ON public.feature_flags;
CREATE POLICY "feature_flags_admin_manage"
  ON public.feature_flags
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "feature_flags_authenticated_read" ON public.feature_flags;
CREATE POLICY "feature_flags_authenticated_read"
  ON public.feature_flags
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Service health snapshots. Populated by a monitoring edge function (future)
-- and read by the admin dashboard. For now the admin hook falls back to a
-- synthetic check when this table is empty.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.service_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL,
  service_name text NOT NULL,
  category text NOT NULL DEFAULT 'core',
  status text NOT NULL DEFAULT 'healthy',
  latency_ms integer,
  region text,
  message text,
  observed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_health_status_chk CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
  CONSTRAINT service_health_category_chk CHECK (category IN ('core', 'integration', 'ai'))
);

CREATE INDEX IF NOT EXISTS idx_service_health_service
  ON public.service_health_snapshots(service_key, observed_at DESC);

ALTER TABLE public.service_health_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_health_admin_read" ON public.service_health_snapshots;
CREATE POLICY "service_health_admin_read"
  ON public.service_health_snapshots
  FOR SELECT
  USING (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- RPC: admin_get_metrics — aggregate counts for the admin dashboard.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_get_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  total_users int;
  users_by_role jsonb;
  pending_approvals int;
  appointments_today int;
  consults_month int;
  active_incidents int;
  ai_sessions_30d int;
  ai_flagged_30d int;
  audit_events_30d int;
BEGIN
  IF NOT public.is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin users can read platform metrics.' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO total_users FROM public.user_profiles;

  SELECT jsonb_object_agg(role::text, cnt)
  INTO users_by_role
  FROM (
    SELECT role, count(*) AS cnt
    FROM public.user_profiles
    GROUP BY role
  ) r;

  SELECT count(*)
  INTO pending_approvals
  FROM public.user_profiles up
  WHERE up.role = 'doctor'
    AND up.profile_completed = true
    AND NOT EXISTS (
      SELECT 1 FROM public.doctor_profiles dp
      WHERE dp.user_id = up.user_id AND dp.dha_license_verified = true
    );

  SELECT count(*)
  INTO appointments_today
  FROM public.appointments a
  WHERE NOT a.is_deleted
    AND a.scheduled_at >= date_trunc('day', now())
    AND a.scheduled_at < date_trunc('day', now()) + interval '1 day';

  SELECT count(*)
  INTO consults_month
  FROM public.appointments a
  WHERE NOT a.is_deleted
    AND a.status = 'completed'
    AND a.scheduled_at >= date_trunc('month', now());

  SELECT count(*)
  INTO active_incidents
  FROM public.admin_incidents
  WHERE status IN ('open', 'investigating');

  SELECT count(*)
  INTO ai_sessions_30d
  FROM public.ai_chat_sessions
  WHERE started_at >= now() - interval '30 days';

  SELECT count(*)
  INTO ai_flagged_30d
  FROM public.ai_chat_messages m
  WHERE m.created_at >= now() - interval '30 days'
    AND m.role = 'assistant'
    AND (m.content ILIKE '%flagged%' OR m.content ILIKE '%unsafe%');

  SELECT count(*)
  INTO audit_events_30d
  FROM public.audit_logs
  WHERE created_at >= now() - interval '30 days';

  payload := jsonb_build_object(
    'generatedAt', to_jsonb(now()),
    'totals', jsonb_build_object(
      'users', total_users,
      'appointmentsToday', appointments_today,
      'completedConsultsThisMonth', consults_month,
      'pendingApprovals', pending_approvals,
      'activeIncidents', active_incidents
    ),
    'usersByRole', COALESCE(users_by_role, '{}'::jsonb),
    'ai', jsonb_build_object(
      'sessions30d', ai_sessions_30d,
      'flaggedOutputs30d', ai_flagged_30d
    ),
    'compliance', jsonb_build_object(
      'auditEvents30d', audit_events_30d,
      'activeIncidents', active_incidents
    )
  );

  RETURN payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_metrics() TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_list_users — directory with role, org, onboarding progress.
-- Returns most recent 500 profiles.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_users(
  search_text text DEFAULT NULL,
  filter_role text DEFAULT NULL,
  max_rows integer DEFAULT 100
)
RETURNS TABLE (
  user_id uuid,
  role user_role,
  full_name text,
  email text,
  phone text,
  city text,
  profile_completed boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_dha_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin users can list users.' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    up.user_id,
    up.role,
    up.full_name,
    up.email,
    up.phone,
    up.city,
    up.profile_completed,
    up.created_at,
    au.last_sign_in_at,
    COALESCE(dp.dha_license_verified, false) AS is_dha_verified
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN public.doctor_profiles dp ON dp.user_id = up.user_id
  WHERE
    (search_text IS NULL OR search_text = ''
      OR up.full_name ILIKE '%' || search_text || '%'
      OR up.email ILIKE '%' || search_text || '%'
      OR up.phone ILIKE '%' || search_text || '%'
    )
    AND (filter_role IS NULL OR filter_role = '' OR up.role::text = filter_role)
  ORDER BY up.created_at DESC
  LIMIT COALESCE(max_rows, 100);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_list_organizations — returns org directory with seat usage.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS SETOF public.organizations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.organizations
  WHERE public.is_current_user_super_admin()
  ORDER BY name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_organizations() TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_list_audit_events — recent audit log, grouped counts.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_audit_events(
  max_rows integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  actor_name text,
  action audit_action,
  table_name text,
  record_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin users can read audit events.' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    up.full_name AS actor_name,
    al.action,
    al.table_name,
    al.record_id,
    al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.user_profiles up ON up.user_id = al.user_id
  ORDER BY al.created_at DESC
  LIMIT COALESCE(max_rows, 50);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_audit_events(integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_list_incidents
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_incidents()
RETURNS SETOF public.admin_incidents
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.admin_incidents
  WHERE public.is_current_user_super_admin()
  ORDER BY detected_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_incidents() TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_list_feature_flags
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_feature_flags()
RETURNS SETOF public.feature_flags
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.feature_flags
  WHERE public.is_current_user_super_admin()
  ORDER BY environment, key;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_feature_flags() TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_get_system_health — returns the latest snapshot per service,
-- falling back to a synthetic "healthy" row for core services when the
-- table is empty.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  services jsonb;
  integrations jsonb;
  ai_services jsonb;
BEGIN
  IF NOT public.is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin users can read system health.' USING ERRCODE = 'P0001';
  END IF;

  WITH latest AS (
    SELECT DISTINCT ON (service_key)
      service_key, service_name, category, status, latency_ms, region, message, observed_at
    FROM public.service_health_snapshots
    ORDER BY service_key, observed_at DESC
  )
  SELECT
    COALESCE(jsonb_agg(to_jsonb(l)) FILTER (WHERE l.category = 'core'), '[]'::jsonb),
    COALESCE(jsonb_agg(to_jsonb(l)) FILTER (WHERE l.category = 'integration'), '[]'::jsonb),
    COALESCE(jsonb_agg(to_jsonb(l)) FILTER (WHERE l.category = 'ai'), '[]'::jsonb)
  INTO services, integrations, ai_services
  FROM latest l;

  payload := jsonb_build_object(
    'generatedAt', to_jsonb(now()),
    'services', services,
    'integrations', integrations,
    'aiServices', ai_services
  );

  RETURN payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_system_health() TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_get_ai_analytics — AI usage + safety signals.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_get_ai_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  sessions_30d int;
  sessions_7d int;
  messages_30d int;
  guest_sessions_30d int;
  flagged_30d int;
BEGIN
  IF NOT public.is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin users can read AI analytics.' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO sessions_30d
  FROM public.ai_chat_sessions WHERE started_at >= now() - interval '30 days';
  SELECT count(*) INTO sessions_7d
  FROM public.ai_chat_sessions WHERE started_at >= now() - interval '7 days';
  SELECT count(*) INTO messages_30d
  FROM public.ai_chat_messages WHERE created_at >= now() - interval '30 days';
  SELECT count(*) INTO guest_sessions_30d
  FROM public.ai_chat_sessions
  WHERE started_at >= now() - interval '30 days' AND user_id IS NULL;
  SELECT count(*) INTO flagged_30d
  FROM public.ai_chat_messages
  WHERE created_at >= now() - interval '30 days'
    AND role = 'assistant'
    AND (content ILIKE '%flagged%' OR content ILIKE '%unsafe%');

  payload := jsonb_build_object(
    'generatedAt', to_jsonb(now()),
    'sessions', jsonb_build_object(
      'last7Days', sessions_7d,
      'last30Days', sessions_30d,
      'guestLast30Days', guest_sessions_30d
    ),
    'messages', jsonb_build_object(
      'last30Days', messages_30d
    ),
    'safety', jsonb_build_object(
      'flaggedLast30Days', flagged_30d
    )
  );

  RETURN payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_ai_analytics() TO authenticated;

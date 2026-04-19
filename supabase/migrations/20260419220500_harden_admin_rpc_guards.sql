-- Harden admin RPC authorization: `is_current_user_super_admin()` returns
-- NULL when there's no JWT context (e.g. the Postgres service role), and
-- `NOT NULL` evaluates to NULL rather than TRUE, so the previous guards
-- silently allowed anonymous calls via the service role.
--
-- Update every admin_* RPC to require an explicit TRUE using `IS NOT TRUE`.

CREATE OR REPLACE FUNCTION public.admin_get_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
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
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can read platform metrics.' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO total_users FROM public.user_profiles;

  SELECT jsonb_object_agg(role::text, cnt) INTO users_by_role
  FROM (SELECT role, count(*) AS cnt FROM public.user_profiles GROUP BY role) r;

  SELECT count(*) INTO pending_approvals
  FROM public.user_profiles up
  WHERE up.role = 'doctor' AND up.profile_completed = true
    AND NOT EXISTS (SELECT 1 FROM public.doctor_profiles dp WHERE dp.user_id = up.user_id AND dp.dha_license_verified = true);

  SELECT count(*) INTO appointments_today
  FROM public.appointments a
  WHERE NOT a.is_deleted
    AND a.scheduled_at >= date_trunc('day', now())
    AND a.scheduled_at < date_trunc('day', now()) + interval '1 day';

  SELECT count(*) INTO consults_month
  FROM public.appointments a
  WHERE NOT a.is_deleted AND a.status = 'completed'
    AND a.scheduled_at >= date_trunc('month', now());

  SELECT count(*) INTO active_incidents
  FROM public.admin_incidents WHERE status IN ('open', 'investigating');

  SELECT count(*) INTO ai_sessions_30d
  FROM public.ai_chat_sessions WHERE started_at >= now() - interval '30 days';

  SELECT count(*) INTO ai_flagged_30d
  FROM public.ai_chat_messages m
  WHERE m.created_at >= now() - interval '30 days'
    AND m.role = 'assistant'
    AND (m.content ILIKE '%flagged%' OR m.content ILIKE '%unsafe%');

  SELECT count(*) INTO audit_events_30d
  FROM public.audit_logs WHERE created_at >= now() - interval '30 days';

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
    'ai', jsonb_build_object('sessions30d', ai_sessions_30d, 'flaggedOutputs30d', ai_flagged_30d),
    'compliance', jsonb_build_object('auditEvents30d', audit_events_30d, 'activeIncidents', active_incidents)
  );
  RETURN payload;
END;
$fn$;

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
AS $fn$
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
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
  WHERE (search_text IS NULL OR search_text = ''
      OR up.full_name ILIKE '%' || search_text || '%'
      OR up.email ILIKE '%' || search_text || '%'
      OR up.phone ILIKE '%' || search_text || '%')
    AND (filter_role IS NULL OR filter_role = '' OR up.role::text = filter_role)
  ORDER BY up.created_at DESC
  LIMIT COALESCE(max_rows, 100);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS SETOF public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can list organizations.' USING ERRCODE = 'P0001';
  END IF;
  RETURN QUERY SELECT * FROM public.organizations ORDER BY name ASC;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_list_audit_events(max_rows integer DEFAULT 50)
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
AS $fn$
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can read audit events.' USING ERRCODE = 'P0001';
  END IF;
  RETURN QUERY
  SELECT al.id, al.user_id, up.full_name AS actor_name, al.action, al.table_name, al.record_id, al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.user_profiles up ON up.user_id = al.user_id
  ORDER BY al.created_at DESC
  LIMIT COALESCE(max_rows, 50);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_list_incidents()
RETURNS SETOF public.admin_incidents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can read incidents.' USING ERRCODE = 'P0001';
  END IF;
  RETURN QUERY SELECT * FROM public.admin_incidents ORDER BY detected_at DESC;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_list_feature_flags()
RETURNS SETOF public.feature_flags
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can read feature flags.' USING ERRCODE = 'P0001';
  END IF;
  RETURN QUERY SELECT * FROM public.feature_flags ORDER BY environment, key;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.admin_get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  payload jsonb;
  services jsonb;
  integrations jsonb;
  ai_services jsonb;
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
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
$fn$;

CREATE OR REPLACE FUNCTION public.admin_get_ai_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  payload jsonb;
  sessions_30d int;
  sessions_7d int;
  messages_30d int;
  guest_sessions_30d int;
  flagged_30d int;
BEGIN
  IF public.is_current_user_super_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Only super_admin users can read AI analytics.' USING ERRCODE = 'P0001';
  END IF;
  SELECT count(*) INTO sessions_30d FROM public.ai_chat_sessions WHERE started_at >= now() - interval '30 days';
  SELECT count(*) INTO sessions_7d FROM public.ai_chat_sessions WHERE started_at >= now() - interval '7 days';
  SELECT count(*) INTO messages_30d FROM public.ai_chat_messages WHERE created_at >= now() - interval '30 days';
  SELECT count(*) INTO guest_sessions_30d FROM public.ai_chat_sessions
    WHERE started_at >= now() - interval '30 days' AND user_id IS NULL;
  SELECT count(*) INTO flagged_30d FROM public.ai_chat_messages
    WHERE created_at >= now() - interval '30 days' AND role = 'assistant'
      AND (content ILIKE '%flagged%' OR content ILIKE '%unsafe%');
  payload := jsonb_build_object(
    'generatedAt', to_jsonb(now()),
    'sessions', jsonb_build_object('last7Days', sessions_7d, 'last30Days', sessions_30d, 'guestLast30Days', guest_sessions_30d),
    'messages', jsonb_build_object('last30Days', messages_30d),
    'safety', jsonb_build_object('flaggedLast30Days', flagged_30d)
  );
  RETURN payload;
END;
$fn$;

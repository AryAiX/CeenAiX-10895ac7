-- Replace super-admin RLS checks that query user_profiles directly.
--
-- Direct user_profiles lookups inside other policies can create recursive
-- evaluation chains when those tables are referenced by user_profiles policies.

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    NULLIF(auth.jwt() ->> 'role', '')
  ) = 'super_admin';
$$;

DROP POLICY IF EXISTS "admins_all_appointments" ON public.appointments;
CREATE POLICY "admins_all_appointments"
  ON public.appointments
  FOR SELECT
  USING (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "admins_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admins_read_audit_logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "admins_manage_settings" ON public.platform_settings;
CREATE POLICY "admins_manage_settings"
  ON public.platform_settings
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "admins_manage_articles" ON public.health_articles;
CREATE POLICY "admins_manage_articles"
  ON public.health_articles
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "admins_manage_plans" ON public.insurance_plans;
CREATE POLICY "admins_manage_plans"
  ON public.insurance_plans
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

-- Fix recursive RLS evaluation on user_profiles.
--
-- The original admin policies queried user_profiles from inside policies on
-- user_profiles, which causes Postgres to recurse when the table is selected or
-- updated. Read the role from JWT claims instead of querying the table again.

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

REVOKE ALL ON FUNCTION public.is_current_user_super_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_super_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.user_profiles;

CREATE POLICY "users_own_profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_read_all_profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_current_user_super_admin());

CREATE POLICY "admins_update_all_profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

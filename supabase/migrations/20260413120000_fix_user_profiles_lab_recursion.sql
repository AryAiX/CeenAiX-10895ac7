-- Fix infinite recursion in user_profiles RLS caused by lab_staff_read_user_profiles
-- referencing public.user_profiles from within a policy on the same table.
--
-- Root cause: a policy on user_profiles did
--   EXISTS (SELECT 1 FROM user_profiles self WHERE ...)
-- which re-triggers RLS on user_profiles, which re-triggers the policy, which
-- re-triggers the subquery, until Postgres aborts with:
--   "infinite recursion detected in policy for relation user_profiles".
--
-- Fix: introduce a SECURITY DEFINER helper `public.is_current_user_lab_staff()`
-- that reads user_profiles with the owner's privileges (RLS is bypassed in
-- SECURITY DEFINER functions when the owner is not subject to FORCE RLS).
-- Then rewrite the policy to use the helper rather than a subquery on the
-- same table.

CREATE OR REPLACE FUNCTION public.is_current_user_lab_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'lab'
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_lab_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_lab_staff() TO authenticated;

DROP POLICY IF EXISTS "lab_staff_read_user_profiles" ON public.user_profiles;
CREATE POLICY "lab_staff_read_user_profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    public.is_current_user_lab_staff()
    AND EXISTS (
      SELECT 1
      FROM public.lab_orders lo
      WHERE NOT lo.is_deleted
        AND (
          lo.assigned_lab_id IS NULL
          OR public.is_current_user_in_lab(lo.assigned_lab_id)
        )
        AND (
          lo.patient_id = user_profiles.user_id
          OR lo.doctor_id = user_profiles.user_id
        )
    )
  );

-- Fix the transitive recursion that happens when user_profiles is read:
--   1. user_profiles policy `lab_staff_read_user_profiles` subqueries lab_orders
--   2. lab_orders has policies that subquery user_profiles again
--   3. Postgres detects infinite recursion
--
-- Rewrite the lab_orders policies to use the SECURITY DEFINER helper
-- `public.is_current_user_lab_staff()` introduced in the previous migration,
-- which bypasses RLS when it reads user_profiles.

DROP POLICY IF EXISTS "lab_staff_read_lab_orders" ON public.lab_orders;
CREATE POLICY "lab_staff_read_lab_orders"
  ON public.lab_orders
  FOR SELECT
  USING (
    NOT is_deleted
    AND (assigned_lab_id IS NULL OR public.is_current_user_in_lab(assigned_lab_id))
    AND public.is_current_user_lab_staff()
  );

DROP POLICY IF EXISTS "lab_staff_update_lab_orders" ON public.lab_orders;
CREATE POLICY "lab_staff_update_lab_orders"
  ON public.lab_orders
  FOR UPDATE
  USING (
    NOT is_deleted
    AND (assigned_lab_id IS NULL OR public.is_current_user_in_lab(assigned_lab_id))
    AND public.is_current_user_lab_staff()
  )
  WITH CHECK (
    NOT is_deleted
    AND (assigned_lab_id IS NULL OR public.is_current_user_in_lab(assigned_lab_id))
    AND public.is_current_user_lab_staff()
  );

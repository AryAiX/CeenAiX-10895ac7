-- Replace remaining ad-hoc user_profiles subqueries in policies with a role
-- check that is safe from recursion.
--
-- Adds `public.is_current_user_doctor()` as a SECURITY DEFINER helper, matching
-- the pattern used by `is_current_user_lab_staff` and `is_current_user_super_admin`,
-- then rewrites three policies that currently embed the subquery:
--   - lab_order_items: lab_staff_read_lab_items
--   - lab_test_catalog_suggestions: lab_test_catalog_suggestions_doctor_insert
--   - medication_catalog_suggestions: medication_catalog_suggestions_doctor_insert

CREATE OR REPLACE FUNCTION public.is_current_user_doctor()
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
      AND up.role = 'doctor'
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_doctor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_doctor() TO authenticated;

DROP POLICY IF EXISTS "lab_staff_read_lab_items" ON public.lab_order_items;
CREATE POLICY "lab_staff_read_lab_items"
  ON public.lab_order_items
  FOR SELECT
  USING (
    public.is_current_user_lab_staff()
    AND EXISTS (
      SELECT 1
      FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
        AND NOT lo.is_deleted
        AND (lo.assigned_lab_id IS NULL OR public.is_current_user_in_lab(lo.assigned_lab_id))
    )
  );

DROP POLICY IF EXISTS "lab_test_catalog_suggestions_doctor_insert" ON public.lab_test_catalog_suggestions;
CREATE POLICY "lab_test_catalog_suggestions_doctor_insert"
  ON public.lab_test_catalog_suggestions
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND public.is_current_user_doctor()
  );

DROP POLICY IF EXISTS "medication_catalog_suggestions_doctor_insert" ON public.medication_catalog_suggestions;
CREATE POLICY "medication_catalog_suggestions_doctor_insert"
  ON public.medication_catalog_suggestions
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND public.is_current_user_doctor()
  );

-- Allow authenticated pharmacy portal users to read the canonical dispensing queue.
-- The UI remains read-only here; dispensing mutations should be added through
-- dedicated pharmacy workflows with narrower checks.

CREATE OR REPLACE FUNCTION public.is_current_user_pharmacy()
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
      AND up.role = 'pharmacy'
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_pharmacy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_pharmacy() TO authenticated;

DROP POLICY IF EXISTS "pharmacy_read_prescriptions_queue" ON public.prescriptions;
CREATE POLICY "pharmacy_read_prescriptions_queue"
  ON public.prescriptions
  FOR SELECT
  TO authenticated
  USING (
    NOT is_deleted
    AND public.is_current_user_pharmacy()
  );

DROP POLICY IF EXISTS "pharmacy_read_prescription_items_queue" ON public.prescription_items;
CREATE POLICY "pharmacy_read_prescription_items_queue"
  ON public.prescription_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.prescriptions p
      WHERE p.id = prescription_items.prescription_id
        AND NOT p.is_deleted
        AND public.is_current_user_pharmacy()
    )
  );

DROP POLICY IF EXISTS "pharmacy_read_prescription_related_profiles" ON public.user_profiles;
CREATE POLICY "pharmacy_read_prescription_related_profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_current_user_pharmacy()
    AND EXISTS (
      SELECT 1
      FROM public.prescriptions p
      WHERE NOT p.is_deleted
        AND (p.patient_id = user_profiles.user_id OR p.doctor_id = user_profiles.user_id)
    )
  );

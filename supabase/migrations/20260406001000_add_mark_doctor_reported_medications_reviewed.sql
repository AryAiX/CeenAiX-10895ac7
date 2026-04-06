-- Allow doctors to mark patient-reported medications as reviewed
-- when they have an appointment-linked relationship with the patient.

CREATE OR REPLACE FUNCTION public.mark_doctor_reported_medications_reviewed(p_medication_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid := auth.uid();
  v_updated_count integer := 0;
BEGIN
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  UPDATE public.patient_reported_medications
  SET review_status = 'reviewed'
  WHERE id = ANY(p_medication_ids)
    AND is_deleted = false
    AND EXISTS (
      SELECT 1
      FROM public.appointments
      WHERE appointments.patient_id = patient_reported_medications.patient_id
        AND appointments.doctor_id = v_current_user_id
        AND appointments.is_deleted = false
    );

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_doctor_reported_medications_reviewed(uuid[]) TO authenticated;

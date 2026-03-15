-- Secure appointment action helpers for doctor/patient flows.

CREATE OR REPLACE FUNCTION public.cancel_patient_appointment(p_appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_appointment_id
    AND patient_id = auth.uid()
    AND is_deleted = false
    AND status IN ('scheduled', 'confirmed')
    AND scheduled_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment could not be cancelled.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_doctor_appointment(p_appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_appointment_id
    AND doctor_id = auth.uid()
    AND is_deleted = false
    AND status IN ('scheduled', 'confirmed')
    AND scheduled_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment could not be cancelled.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_patient_appointment(
  p_appointment_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_chief_complaint text,
  p_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_scheduled_at <= now() THEN
    RAISE EXCEPTION 'New appointment time must be in the future.';
  END IF;

  IF p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'Appointment duration must be greater than zero.';
  END IF;

  UPDATE public.appointments
  SET scheduled_at = p_scheduled_at,
      duration_minutes = p_duration_minutes,
      chief_complaint = NULLIF(btrim(p_chief_complaint), ''),
      notes = NULLIF(btrim(p_notes), ''),
      status = 'scheduled',
      updated_at = now()
  WHERE id = p_appointment_id
    AND patient_id = auth.uid()
    AND is_deleted = false
    AND status IN ('scheduled', 'confirmed')
    AND scheduled_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment could not be rescheduled.';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_patient_appointment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_doctor_appointment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_patient_appointment(uuid, timestamptz, integer, text, text) TO authenticated;

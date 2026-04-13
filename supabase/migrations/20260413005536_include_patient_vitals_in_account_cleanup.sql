CREATE OR REPLACE FUNCTION public.delete_current_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE patient_id = current_user_id
       OR doctor_id = current_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.prescriptions
    WHERE patient_id = current_user_id
       OR doctor_id = current_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.lab_orders
    WHERE patient_id = current_user_id
       OR doctor_id = current_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.consultation_notes
    WHERE doctor_id = current_user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.medical_conditions
    WHERE patient_id = current_user_id
      AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1
    FROM public.allergies
    WHERE patient_id = current_user_id
      AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1
    FROM public.vaccinations
    WHERE patient_id = current_user_id
      AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1
    FROM public.patient_vitals
    WHERE patient_id = current_user_id
      AND NOT is_deleted
  ) OR EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE created_by = current_user_id
  ) THEN
    RAISE EXCEPTION 'Your account cannot be self-deleted after clinical or shared care data exists. Please contact support.';
  END IF;

  DELETE FROM public.notifications
  WHERE user_id = current_user_id;

  DELETE FROM public.messages
  WHERE sender_id = current_user_id;

  DELETE FROM public.patient_insurance
  WHERE patient_id = current_user_id;

  DELETE FROM public.patient_vitals
  WHERE patient_id = current_user_id;

  DELETE FROM public.doctor_availability
  WHERE doctor_id = current_user_id;

  DELETE FROM public.blocked_slots
  WHERE doctor_id = current_user_id;

  DELETE FROM public.ai_chat_sessions
  WHERE user_id = current_user_id
     OR context_patient_id = current_user_id;

  DELETE FROM public.audit_logs
  WHERE user_id = current_user_id;

  UPDATE public.platform_settings
  SET updated_by = NULL
  WHERE updated_by = current_user_id;

  DELETE FROM auth.users
  WHERE id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_current_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_current_user_account() TO authenticated;

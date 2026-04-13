-- Normalize demo doctor portal identity and same-day schedule so both demo doctor
-- accounts render the published-style doctor portal content.

WITH target_doctors AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
      OR lower(coalesce(up.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
    )
)
UPDATE public.user_profiles up
SET full_name = 'Dr. Ahmed Al Rashidi',
    first_name = 'Ahmed',
    last_name = 'Al Rashidi',
    city = 'Dubai Healthcare City',
    address = 'Al Noor Medical Center'
FROM target_doctors
WHERE up.user_id = target_doctors.user_id;

WITH target_doctors AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
      OR lower(coalesce(up.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
    )
)
UPDATE public.doctor_profiles dp
SET specialization = 'Cardiologist',
    consultation_fee = 300,
    license_number = 'DHA-PRAC-2018-047821',
    dha_license_verified = true,
    dha_verified_at = COALESCE(dp.dha_verified_at, now())
FROM target_doctors
WHERE dp.user_id = target_doctors.user_id;

WITH target_doctors AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
      OR lower(coalesce(up.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
    )
)
UPDATE public.appointments appointments
SET is_deleted = true,
    deleted_at = now()
FROM target_doctors
WHERE appointments.doctor_id = target_doctors.user_id
  AND appointments.is_deleted = false
  AND (
    coalesce(appointments.notes, '') LIKE 'doctor_dashboard_seed_today_%'
    OR coalesce(appointments.notes, '') LIKE 'doctor2_dashboard_seed_today_%'
    OR coalesce(appointments.notes, '') LIKE 'doctor_portal_seed_slot_%'
  );

WITH target_patient AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'patient'
    AND (
      lower(coalesce(au.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) = 'patient 1'
    )
  LIMIT 1
),
target_doctors AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
      OR lower(coalesce(up.email, '')) IN ('doctor1@aryaix.com', 'doctor2@aryaix.com')
    )
),
seed_schedule AS (
  SELECT * FROM (
    VALUES
      ('doctor_portal_seed_slot_1', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '9 hours') AT TIME ZONE 'Asia/Dubai'), 22, 'Follow-up - Hypertension'),
      ('doctor_portal_seed_slot_2', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '9 hours 30 minutes') AT TIME ZONE 'Asia/Dubai'), 28, 'Post-MRI Cardiology'),
      ('doctor_portal_seed_slot_3', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '10 hours') AT TIME ZONE 'Asia/Dubai'), 35, 'New - Chest Pain'),
      ('doctor_portal_seed_slot_4', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '10 hours 45 minutes') AT TIME ZONE 'Asia/Dubai'), 20, 'Echo Review'),
      ('doctor_portal_seed_slot_5', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 30 minutes') AT TIME ZONE 'Asia/Dubai'), 15, 'URGENT - Chest Pain'),
      ('doctor_portal_seed_slot_6', 'in_progress'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '14 hours') AT TIME ZONE 'Asia/Dubai'), 40, 'Heart Failure Follow-up'),
      ('doctor_portal_seed_slot_7', 'confirmed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '14 hours 45 minutes') AT TIME ZONE 'Asia/Dubai'), 30, 'Post-Stent Follow-up'),
      ('doctor_portal_seed_slot_8', 'confirmed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '15 hours 30 minutes') AT TIME ZONE 'Asia/Dubai'), 30, 'New - Palpitations')
  ) AS rows(seed_note, seed_status, seed_time, seed_duration, seed_complaint)
)
INSERT INTO public.appointments (
  patient_id,
  doctor_id,
  type,
  status,
  scheduled_at,
  duration_minutes,
  chief_complaint,
  notes
)
SELECT
  target_patient.user_id,
  target_doctors.user_id,
  'in_person',
  seed_schedule.seed_status,
  seed_schedule.seed_time,
  seed_schedule.seed_duration,
  seed_schedule.seed_complaint,
  seed_schedule.seed_note
FROM target_patient
CROSS JOIN target_doctors
CROSS JOIN seed_schedule;

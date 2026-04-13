-- Seed live doctor dashboard sample data for the second demo doctor account.
-- This migration is rerunnable and avoids hardcoded auth UUIDs by resolving demo users
-- from canonical profile/email fields before inserting or updating records.

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
)
UPDATE public.user_profiles up
SET full_name = 'Dr. Sarah Al Khateeb',
    city = 'Dubai'
FROM target_doctor
WHERE up.user_id = target_doctor.user_id;

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
)
UPDATE public.doctor_profiles dp
SET specialization = 'Internal Medicine',
    consultation_fee = COALESCE(dp.consultation_fee, 300),
    license_number = 'DHA-PRAC-2019-051204',
    dha_license_verified = true,
    dha_verified_at = COALESCE(dp.dha_verified_at, now())
FROM target_doctor
WHERE dp.user_id = target_doctor.user_id;

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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
seed_rows AS (
  SELECT * FROM (
    VALUES
      ('doctor2_dashboard_seed_today_completed', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '8 hours 45 minutes') AT TIME ZONE 'Asia/Dubai'), 25, 'Diabetes review and medication adjustment'),
      ('doctor2_dashboard_seed_today_active', 'in_progress'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '12 hours 20 minutes') AT TIME ZONE 'Asia/Dubai'), 35, 'Persistent dizziness and blood-pressure follow-up'),
      ('doctor2_dashboard_seed_today_upcoming', 'confirmed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '15 hours 40 minutes') AT TIME ZONE 'Asia/Dubai'), 30, 'General medicine follow-up and labs review')
  ) AS rows(seed_note, seed_status, seed_time, seed_duration, seed_complaint)
)
UPDATE public.appointments appointments
SET type = 'in_person',
    status = seed_rows.seed_status,
    scheduled_at = seed_rows.seed_time,
    duration_minutes = seed_rows.seed_duration,
    chief_complaint = seed_rows.seed_complaint,
    notes = seed_rows.seed_note,
    is_deleted = false,
    deleted_at = NULL
FROM target_patient, target_doctor, seed_rows
WHERE appointments.patient_id = target_patient.user_id
  AND appointments.doctor_id = target_doctor.user_id
  AND appointments.notes = seed_rows.seed_note;

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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
seed_rows AS (
  SELECT * FROM (
    VALUES
      ('doctor2_dashboard_seed_today_completed', 'completed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '8 hours 45 minutes') AT TIME ZONE 'Asia/Dubai'), 25, 'Diabetes review and medication adjustment'),
      ('doctor2_dashboard_seed_today_active', 'in_progress'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '12 hours 20 minutes') AT TIME ZONE 'Asia/Dubai'), 35, 'Persistent dizziness and blood-pressure follow-up'),
      ('doctor2_dashboard_seed_today_upcoming', 'confirmed'::appointment_status, ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '15 hours 40 minutes') AT TIME ZONE 'Asia/Dubai'), 30, 'General medicine follow-up and labs review')
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
  target_doctor.user_id,
  'in_person',
  seed_rows.seed_status,
  seed_rows.seed_time,
  seed_rows.seed_duration,
  seed_rows.seed_complaint,
  seed_rows.seed_note
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_rows
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = seed_rows.seed_note
    AND appointments.is_deleted = false
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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
)
INSERT INTO public.conversations (
  created_by,
  participant_ids,
  subject,
  last_message_at
)
SELECT
  target_doctor.user_id,
  jsonb_build_array(target_patient.user_id::text, target_doctor.user_id::text),
  'Care conversation',
  NULL
FROM target_patient
CROSS JOIN target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.conversations conversations
  WHERE jsonb_array_length(conversations.participant_ids) = 2
    AND conversations.participant_ids @> jsonb_build_array(target_patient.user_id::text, target_doctor.user_id::text)
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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
target_conversation AS (
  SELECT conversations.id
  FROM public.conversations conversations
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  WHERE jsonb_array_length(conversations.participant_ids) = 2
    AND conversations.participant_ids @> jsonb_build_array(target_patient.user_id::text, target_doctor.user_id::text)
  LIMIT 1
),
seed_message_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 25 minutes') AT TIME ZONE 'Asia/Dubai') AS sent_at
)
INSERT INTO public.messages (
  conversation_id,
  sender_id,
  body,
  sent_at,
  read_at
)
SELECT
  target_conversation.id,
  target_patient.user_id,
  'My dizziness is a bit better after breakfast, but I still feel light-headed when standing up quickly.',
  seed_message_time.sent_at,
  NULL
FROM target_patient
CROSS JOIN target_conversation
CROSS JOIN seed_message_time
WHERE NOT EXISTS (
  SELECT 1
  FROM public.messages messages
  WHERE messages.conversation_id = target_conversation.id
    AND messages.sender_id = target_patient.user_id
    AND messages.body = 'My dizziness is a bit better after breakfast, but I still feel light-headed when standing up quickly.'
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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
target_conversation AS (
  SELECT conversations.id
  FROM public.conversations conversations
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  WHERE jsonb_array_length(conversations.participant_ids) = 2
    AND conversations.participant_ids @> jsonb_build_array(target_patient.user_id::text, target_doctor.user_id::text)
  LIMIT 1
)
UPDATE public.conversations conversations
SET last_message_at = (
  SELECT max(messages.sent_at)
  FROM public.messages messages
  WHERE messages.conversation_id = target_conversation.id
)
FROM target_conversation
WHERE conversations.id = target_conversation.id;

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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
active_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = 'doctor2_dashboard_seed_today_active'
    AND appointments.is_deleted = false
  LIMIT 1
),
seed_lab_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '10 hours 55 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
)
INSERT INTO public.lab_orders (
  patient_id,
  doctor_id,
  appointment_id,
  status,
  ordered_at
)
SELECT
  target_patient.user_id,
  target_doctor.user_id,
  active_appointment.id,
  'resulted',
  seed_lab_time.resulted_at
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN active_appointment
CROSS JOIN seed_lab_time
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_orders lab_orders
  WHERE lab_orders.patient_id = target_patient.user_id
    AND lab_orders.doctor_id = target_doctor.user_id
    AND lab_orders.appointment_id = active_appointment.id
    AND lab_orders.ordered_at = seed_lab_time.resulted_at
    AND lab_orders.is_deleted = false
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
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
),
active_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = 'doctor2_dashboard_seed_today_active'
    AND appointments.is_deleted = false
  LIMIT 1
),
target_lab_order AS (
  SELECT lab_orders.id
  FROM public.lab_orders lab_orders
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  CROSS JOIN active_appointment
  WHERE lab_orders.patient_id = target_patient.user_id
    AND lab_orders.doctor_id = target_doctor.user_id
    AND lab_orders.appointment_id = active_appointment.id
    AND lab_orders.is_deleted = false
  ORDER BY lab_orders.ordered_at DESC
  LIMIT 1
),
seed_lab_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '10 hours 55 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
)
INSERT INTO public.lab_order_items (
  lab_order_id,
  test_name,
  test_code,
  status,
  result_value,
  result_unit,
  reference_range,
  is_abnormal,
  resulted_at
)
SELECT
  target_lab_order.id,
  'Potassium',
  'K',
  'resulted',
  '6.1',
  'mmol/L',
  '3.5 - 5.1',
  true,
  seed_lab_time.resulted_at
FROM target_lab_order
CROSS JOIN seed_lab_time
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_order_items lab_order_items
  WHERE lab_order_items.lab_order_id = target_lab_order.id
    AND lab_order_items.test_name = 'Potassium'
);

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb')
    )
  LIMIT 1
)
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  body,
  is_read,
  action_url,
  created_at
)
SELECT
  target_doctor.user_id,
  'lab_result',
  'Critical potassium result requires acknowledgment',
  'A potassium result of 6.1 mmol/L has been posted for Patient 1. Review the lab order and document your action.',
  false,
  '/doctor/lab-orders',
  ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours') AT TIME ZONE 'Asia/Dubai')
FROM target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications notifications
  WHERE notifications.user_id = target_doctor.user_id
    AND notifications.title = 'Critical potassium result requires acknowledgment'
);

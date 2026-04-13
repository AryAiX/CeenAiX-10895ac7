-- Seed live doctor dashboard sample data for the existing demo doctor accounts.
-- This migration is rerunnable and avoids hardcoded auth UUIDs by resolving demo users
-- from canonical profile/email fields before inserting or updating records.

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
)
UPDATE public.user_profiles up
SET full_name = 'Dr. Ahmed Al Rashidi',
    city = 'Dubai Healthcare City'
FROM target_doctor
WHERE up.user_id = target_doctor.user_id
  AND (
    coalesce(up.full_name, '') <> 'Dr. Ahmed Al Rashidi'
    OR coalesce(up.city, '') <> 'Dubai Healthcare City'
  );

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
)
UPDATE public.doctor_profiles dp
SET specialization = 'Cardiologist',
    consultation_fee = COALESCE(dp.consultation_fee, 350),
    license_number = 'DHA-PRAC-2018-047821',
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '9 hours') AT TIME ZONE 'Asia/Dubai') AS completed_at,
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '13 hours 30 minutes') AT TIME ZONE 'Asia/Dubai') AS active_at,
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '16 hours 15 minutes') AT TIME ZONE 'Asia/Dubai') AS upcoming_at
)
UPDATE public.appointments appointments
SET type = 'in_person',
    status = 'completed',
    scheduled_at = seed_slots.completed_at,
    duration_minutes = 30,
    chief_complaint = 'Hypertension follow-up and medication review',
    notes = 'doctor_dashboard_seed_today_completed',
    is_deleted = false,
    deleted_at = NULL
FROM target_patient, target_doctor, seed_slots
WHERE appointments.patient_id = target_patient.user_id
  AND appointments.doctor_id = target_doctor.user_id
  AND appointments.notes = 'doctor_dashboard_seed_today_completed';

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '9 hours') AT TIME ZONE 'Asia/Dubai') AS completed_at
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
  'completed',
  seed_slots.completed_at,
  30,
  'Hypertension follow-up and medication review',
  'doctor_dashboard_seed_today_completed'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_slots
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = 'doctor_dashboard_seed_today_completed'
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '13 hours 30 minutes') AT TIME ZONE 'Asia/Dubai') AS active_at
)
UPDATE public.appointments appointments
SET type = 'in_person',
    status = 'in_progress',
    scheduled_at = seed_slots.active_at,
    duration_minutes = 40,
    chief_complaint = 'Chest pain follow-up and ECG review',
    notes = 'doctor_dashboard_seed_today_active',
    is_deleted = false,
    deleted_at = NULL
FROM target_patient, target_doctor, seed_slots
WHERE appointments.patient_id = target_patient.user_id
  AND appointments.doctor_id = target_doctor.user_id
  AND appointments.notes = 'doctor_dashboard_seed_today_active';

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '13 hours 30 minutes') AT TIME ZONE 'Asia/Dubai') AS active_at
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
  'in_progress',
  seed_slots.active_at,
  40,
  'Chest pain follow-up and ECG review',
  'doctor_dashboard_seed_today_active'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_slots
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = 'doctor_dashboard_seed_today_active'
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '16 hours 15 minutes') AT TIME ZONE 'Asia/Dubai') AS upcoming_at
)
UPDATE public.appointments appointments
SET type = 'in_person',
    status = 'confirmed',
    scheduled_at = seed_slots.upcoming_at,
    duration_minutes = 25,
    chief_complaint = 'Palpitations review and next-step planning',
    notes = 'doctor_dashboard_seed_today_upcoming',
    is_deleted = false,
    deleted_at = NULL
FROM target_patient, target_doctor, seed_slots
WHERE appointments.patient_id = target_patient.user_id
  AND appointments.doctor_id = target_doctor.user_id
  AND appointments.notes = 'doctor_dashboard_seed_today_upcoming';

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_slots AS (
  SELECT
    ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '16 hours 15 minutes') AT TIME ZONE 'Asia/Dubai') AS upcoming_at
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
  'confirmed',
  seed_slots.upcoming_at,
  25,
  'Palpitations review and next-step planning',
  'doctor_dashboard_seed_today_upcoming'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_slots
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.notes = 'doctor_dashboard_seed_today_upcoming'
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
)
UPDATE public.conversations conversations
SET subject = 'Care conversation'
FROM target_patient, target_doctor
WHERE jsonb_array_length(conversations.participant_ids) = 2
  AND conversations.participant_ids @> jsonb_build_array(target_patient.user_id::text, target_doctor.user_id::text)
  AND coalesce(conversations.subject, '') = '';

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '12 hours 40 minutes') AT TIME ZONE 'Asia/Dubai') AS sent_at
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
  'I have uploaded my morning blood-pressure readings. Chest tightness has improved, but I still feel palpitations after walking upstairs.',
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
    AND messages.body = 'I have uploaded my morning blood-pressure readings. Chest tightness has improved, but I still feel palpitations after walking upstairs.'
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
    AND appointments.notes = 'doctor_dashboard_seed_today_active'
    AND appointments.is_deleted = false
  LIMIT 1
),
seed_lab_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 47 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
)
UPDATE public.lab_orders lab_orders
SET status = 'resulted',
    ordered_at = seed_lab_time.resulted_at
FROM target_patient, target_doctor, active_appointment, seed_lab_time
WHERE lab_orders.patient_id = target_patient.user_id
  AND lab_orders.doctor_id = target_doctor.user_id
  AND lab_orders.appointment_id = active_appointment.id
  AND lab_orders.ordered_at = seed_lab_time.resulted_at;

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
    AND appointments.notes = 'doctor_dashboard_seed_today_active'
    AND appointments.is_deleted = false
  LIMIT 1
),
seed_lab_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 47 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
    AND appointments.notes = 'doctor_dashboard_seed_today_active'
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
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 47 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
)
UPDATE public.lab_order_items lab_order_items
SET status = 'resulted',
    result_value = '2.8',
    result_unit = 'ng/mL',
    reference_range = '< 0.04',
    is_abnormal = true,
    resulted_at = seed_lab_time.resulted_at,
    test_code = 'TROP-I'
FROM target_lab_order, seed_lab_time
WHERE lab_order_items.lab_order_id = target_lab_order.id
  AND lab_order_items.test_name = 'Troponin I';

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
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
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
    AND appointments.notes = 'doctor_dashboard_seed_today_active'
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
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 47 minutes') AT TIME ZONE 'Asia/Dubai') AS resulted_at
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
  'Troponin I',
  'TROP-I',
  'resulted',
  '2.8',
  'ng/mL',
  '< 0.04',
  true,
  seed_lab_time.resulted_at
FROM target_lab_order
CROSS JOIN seed_lab_time
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_order_items lab_order_items
  WHERE lab_order_items.lab_order_id = target_lab_order.id
    AND lab_order_items.test_name = 'Troponin I'
);

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_notification_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 50 minutes') AT TIME ZONE 'Asia/Dubai') AS created_at
)
UPDATE public.notifications notifications
SET type = 'lab_result',
    title = 'Critical troponin result requires acknowledgment',
    body = 'A troponin I result of 2.8 ng/mL has been posted for Patient 1. Review the lab order and document your action.',
    is_read = false,
    action_url = '/doctor/lab-orders',
    created_at = seed_notification_time.created_at
FROM target_doctor, seed_notification_time
WHERE notifications.user_id = target_doctor.user_id
  AND notifications.title = 'Critical troponin result requires acknowledgment';

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 1', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_notification_time AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '11 hours 50 minutes') AT TIME ZONE 'Asia/Dubai') AS created_at
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
  'Critical troponin result requires acknowledgment',
  'A troponin I result of 2.8 ng/mL has been posted for Patient 1. Review the lab order and document your action.',
  false,
  '/doctor/lab-orders',
  seed_notification_time.created_at
FROM target_doctor
CROSS JOIN seed_notification_time
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications notifications
  WHERE notifications.user_id = target_doctor.user_id
    AND notifications.title = 'Critical troponin result requires acknowledgment'
);

-- Seed live dashboard sample data for the existing patient1 / doctor1 demo accounts.
-- This migration is rerunnable and avoids hardcoded auth UUIDs by resolving demo users
-- from canonical profile/email fields before inserting or updating records.

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
)
UPDATE public.user_profiles up
SET city = 'Dubai'
FROM target_patient
WHERE up.user_id = target_patient.user_id
  AND coalesce(up.city, '') <> 'Dubai';

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
    )
  LIMIT 1
)
UPDATE public.user_profiles up
SET city = 'Dubai Healthcare City'
FROM target_doctor
WHERE up.user_id = target_doctor.user_id
  AND coalesce(up.city, '') <> 'Dubai Healthcare City';

WITH target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
    )
  LIMIT 1
)
UPDATE public.doctor_profiles dp
SET specialization = COALESCE(NULLIF(dp.specialization, ''), 'Internal Medicine'),
    consultation_fee = COALESCE(dp.consultation_fee, 350)
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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
    )
  LIMIT 1
),
seed_slot AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '3 days 10 hours') AT TIME ZONE 'Asia/Dubai') AS scheduled_at
)
UPDATE public.appointments appointments
SET type = 'in_person',
    status = 'confirmed',
    scheduled_at = seed_slot.scheduled_at,
    duration_minutes = 30,
    chief_complaint = 'Quarterly diabetes and blood-pressure follow-up',
    notes = 'Seeded follow-up visit for dashboard preview cards.',
    is_deleted = false,
    deleted_at = NULL
FROM target_patient, target_doctor, seed_slot
WHERE appointments.patient_id = target_patient.user_id
  AND appointments.doctor_id = target_doctor.user_id
  AND appointments.chief_complaint = 'Quarterly diabetes and blood-pressure follow-up';

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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
    )
  LIMIT 1
),
seed_slot AS (
  SELECT ((date_trunc('day', now() AT TIME ZONE 'Asia/Dubai') + interval '3 days 10 hours') AT TIME ZONE 'Asia/Dubai') AS scheduled_at
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
  seed_slot.scheduled_at,
  30,
  'Quarterly diabetes and blood-pressure follow-up',
  'Seeded follow-up visit for dashboard preview cards.'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_slot
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.chief_complaint = 'Quarterly diabetes and blood-pressure follow-up'
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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
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
  ORDER BY conversations.last_message_at DESC NULLS LAST, conversations.created_at DESC
  LIMIT 1
),
seed_message AS (
  SELECT
    'Your next follow-up is ready to confirm. Please bring your home blood-pressure log and latest glucose readings.'::text AS body,
    date_trunc('minute', now() - interval '2 hours') AS sent_at
)
UPDATE public.messages messages
SET sent_at = seed_message.sent_at,
    read_at = NULL
FROM target_conversation, target_doctor, seed_message
WHERE messages.conversation_id = target_conversation.id
  AND messages.sender_id = target_doctor.user_id
  AND messages.body = seed_message.body;

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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
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
  ORDER BY conversations.last_message_at DESC NULLS LAST, conversations.created_at DESC
  LIMIT 1
),
seed_message AS (
  SELECT
    'Your next follow-up is ready to confirm. Please bring your home blood-pressure log and latest glucose readings.'::text AS body,
    date_trunc('minute', now() - interval '2 hours') AS sent_at
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
  target_doctor.user_id,
  seed_message.body,
  seed_message.sent_at,
  NULL
FROM target_conversation
CROSS JOIN target_doctor
CROSS JOIN seed_message
WHERE NOT EXISTS (
  SELECT 1
  FROM public.messages messages
  WHERE messages.conversation_id = target_conversation.id
    AND messages.sender_id = target_doctor.user_id
    AND messages.body = seed_message.body
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
      OR lower(coalesce(up.full_name, '')) = 'doctor 1'
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
  ORDER BY conversations.last_message_at DESC NULLS LAST, conversations.created_at DESC
  LIMIT 1
),
seed_message AS (
  SELECT
    date_trunc('minute', now() - interval '2 hours') AS sent_at
)
UPDATE public.conversations conversations
SET last_message_at = seed_message.sent_at
FROM target_conversation, seed_message
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
seed_notification AS (
  SELECT
    'Upcoming appointment confirmed'::text AS title,
    'Your follow-up visit has been prepared in the dashboard with live appointment and message data.'::text AS body,
    date_trunc('minute', now() - interval '90 minutes') AS created_at
)
UPDATE public.notifications notifications
SET type = 'appointment',
    body = seed_notification.body,
    is_read = false,
    action_url = '/patient/appointments',
    created_at = seed_notification.created_at
FROM target_patient, seed_notification
WHERE notifications.user_id = target_patient.user_id
  AND notifications.title = seed_notification.title;

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
seed_notification AS (
  SELECT
    'Upcoming appointment confirmed'::text AS title,
    'Your follow-up visit has been prepared in the dashboard with live appointment and message data.'::text AS body,
    date_trunc('minute', now() - interval '90 minutes') AS created_at
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
  target_patient.user_id,
  'appointment',
  seed_notification.title,
  seed_notification.body,
  false,
  '/patient/appointments',
  seed_notification.created_at
FROM target_patient
CROSS JOIN seed_notification
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications notifications
  WHERE notifications.user_id = target_patient.user_id
    AND notifications.title = seed_notification.title
);

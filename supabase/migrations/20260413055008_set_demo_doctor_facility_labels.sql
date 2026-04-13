-- Set facility labels for demo doctor accounts so the doctor portal card
-- matches the published-style shell more closely.

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
SET address = 'Al Noor Medical Center'
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
UPDATE public.user_profiles up
SET address = 'Dubai Specialist Clinic'
FROM target_doctor
WHERE up.user_id = target_doctor.user_id;

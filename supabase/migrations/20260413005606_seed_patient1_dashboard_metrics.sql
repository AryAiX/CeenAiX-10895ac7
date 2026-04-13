-- Seed dashboard-supporting insurance, vitals, and HbA1c trend data for patient1.

INSERT INTO public.insurance_plans (
  name,
  provider_company,
  coverage_type,
  annual_limit,
  co_pay_percentage,
  network_type,
  is_active
)
SELECT
  'Enhanced Care',
  'Daman',
  'Comprehensive',
  25000,
  20,
  'Direct billing',
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.insurance_plans plans
  WHERE lower(plans.provider_company) = 'daman'
    AND lower(plans.name) = 'enhanced care'
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
target_plan AS (
  SELECT plans.id
  FROM public.insurance_plans plans
  WHERE lower(plans.provider_company) = 'daman'
    AND lower(plans.name) = 'enhanced care'
  LIMIT 1
)
INSERT INTO public.patient_insurance (
  patient_id,
  insurance_plan_id,
  policy_number,
  member_id,
  valid_from,
  valid_until,
  is_primary,
  annual_limit_used
)
SELECT
  target_patient.user_id,
  target_plan.id,
  'DX-2026-88421',
  'MBR-220184',
  DATE '2026-01-01',
  DATE '2026-12-31',
  true,
  9250
FROM target_patient
CROSS JOIN target_plan
WHERE NOT EXISTS (
  SELECT 1
  FROM public.patient_insurance insurance
  WHERE insurance.patient_id = target_patient.user_id
    AND insurance.insurance_plan_id = target_plan.id
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
target_plan AS (
  SELECT plans.id
  FROM public.insurance_plans plans
  WHERE lower(plans.provider_company) = 'daman'
    AND lower(plans.name) = 'enhanced care'
  LIMIT 1
)
UPDATE public.patient_insurance insurance
SET annual_limit_used = 9250,
    valid_from = COALESCE(insurance.valid_from, DATE '2026-01-01'),
    valid_until = COALESCE(insurance.valid_until, DATE '2026-12-31')
FROM target_patient, target_plan
WHERE insurance.patient_id = target_patient.user_id
  AND insurance.insurance_plan_id = target_plan.id;

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
seed_vitals(recorded_at, systolic_bp, diastolic_bp, heart_rate, spo2_percent, weight_kg, bmi) AS (
  VALUES
    (TIMESTAMPTZ '2026-04-06 08:15:00+04', 134, 86, 78, 98, 82.8, 27.4),
    (TIMESTAMPTZ '2026-04-07 08:10:00+04', 132, 84, 76, 98, 82.6, 27.3),
    (TIMESTAMPTZ '2026-04-08 08:05:00+04', 130, 83, 75, 98, 82.5, 27.3),
    (TIMESTAMPTZ '2026-04-09 08:00:00+04', 129, 83, 74, 99, 82.3, 27.2),
    (TIMESTAMPTZ '2026-04-10 08:00:00+04', 128, 82, 74, 99, 82.2, 27.2),
    (TIMESTAMPTZ '2026-04-11 08:05:00+04', 128, 82, 73, 99, 82.1, 27.2),
    (TIMESTAMPTZ '2026-04-12 08:05:00+04', 128, 82, 72, 99, 82.0, 27.1)
)
INSERT INTO public.patient_vitals (
  patient_id,
  recorded_by,
  recorded_at,
  systolic_bp,
  diastolic_bp,
  heart_rate,
  spo2_percent,
  weight_kg,
  bmi,
  source,
  notes
)
SELECT
  target_patient.user_id,
  target_doctor.user_id,
  seed_vitals.recorded_at,
  seed_vitals.systolic_bp,
  seed_vitals.diastolic_bp,
  seed_vitals.heart_rate,
  seed_vitals.spo2_percent,
  seed_vitals.weight_kg,
  seed_vitals.bmi,
  'manual',
  'Seeded home vitals for dashboard trends.'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_vitals
WHERE NOT EXISTS (
  SELECT 1
  FROM public.patient_vitals vitals
  WHERE vitals.patient_id = target_patient.user_id
    AND vitals.recorded_at = seed_vitals.recorded_at
    AND vitals.is_deleted = false
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
seed_orders(ordered_at, resulted_at, result_value) AS (
  VALUES
    (TIMESTAMPTZ '2025-08-22 09:00:00+04', TIMESTAMPTZ '2025-08-22 15:00:00+04', '8.0'),
    (TIMESTAMPTZ '2025-11-14 09:00:00+04', TIMESTAMPTZ '2025-11-14 15:00:00+04', '7.6'),
    (TIMESTAMPTZ '2025-12-20 09:00:00+04', TIMESTAMPTZ '2025-12-20 15:00:00+04', '7.3')
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
  NULL,
  'reviewed',
  seed_orders.ordered_at
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_orders
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_orders orders
  WHERE orders.patient_id = target_patient.user_id
    AND orders.doctor_id = target_doctor.user_id
    AND orders.ordered_at = seed_orders.ordered_at
    AND orders.is_deleted = false
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
seed_orders(ordered_at, resulted_at, result_value) AS (
  VALUES
    (TIMESTAMPTZ '2025-08-22 09:00:00+04', TIMESTAMPTZ '2025-08-22 15:00:00+04', '8.0'),
    (TIMESTAMPTZ '2025-11-14 09:00:00+04', TIMESTAMPTZ '2025-11-14 15:00:00+04', '7.6'),
    (TIMESTAMPTZ '2025-12-20 09:00:00+04', TIMESTAMPTZ '2025-12-20 15:00:00+04', '7.3')
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
  orders.id,
  'HbA1c',
  'HBA1C',
  'resulted',
  seed_orders.result_value,
  '%',
  '4.0 - 5.6',
  seed_orders.result_value::numeric > 5.6,
  seed_orders.resulted_at
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN seed_orders
JOIN public.lab_orders orders
  ON orders.patient_id = target_patient.user_id
 AND orders.doctor_id = target_doctor.user_id
 AND orders.ordered_at = seed_orders.ordered_at
 AND orders.is_deleted = false
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_order_items items
  WHERE items.lab_order_id = orders.id
    AND items.test_name = 'HbA1c'
);

-- Seed canonical patient history for the existing patient1 test account.

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
INSERT INTO public.medical_conditions (
  patient_id,
  condition_name,
  icd_code,
  diagnosed_date,
  status,
  notes
)
SELECT
  target_patient.user_id,
  'Hypertension',
  'I10',
  DATE '2024-09-14',
  'active',
  'Patient tracks blood pressure at home and notices higher morning readings during stressful weeks.'
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.medical_conditions mc
  WHERE mc.patient_id = target_patient.user_id
    AND mc.condition_name = 'Hypertension'
    AND mc.is_deleted = false
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
)
INSERT INTO public.medical_conditions (
  patient_id,
  condition_name,
  icd_code,
  diagnosed_date,
  status,
  notes
)
SELECT
  target_patient.user_id,
  'Type 2 Diabetes',
  'E11.9',
  DATE '2023-06-21',
  'chronic',
  'Managing with oral medication, lower-sugar meal plan, and repeat HbA1c checks.'
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.medical_conditions mc
  WHERE mc.patient_id = target_patient.user_id
    AND mc.condition_name = 'Type 2 Diabetes'
    AND mc.is_deleted = false
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
)
INSERT INTO public.allergies (
  patient_id,
  allergen,
  severity,
  reaction,
  confirmed_by_doctor
)
SELECT
  target_patient.user_id,
  'Penicillin',
  'severe',
  'Diffuse hives and shortness of breath after a prior antibiotic course.',
  true
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.allergies allergies
  WHERE allergies.patient_id = target_patient.user_id
    AND allergies.allergen = 'Penicillin'
    AND allergies.is_deleted = false
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
)
INSERT INTO public.allergies (
  patient_id,
  allergen,
  severity,
  reaction,
  confirmed_by_doctor
)
SELECT
  target_patient.user_id,
  'Shellfish',
  'moderate',
  'Itchy rash and lip swelling when eating shrimp.',
  false
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.allergies allergies
  WHERE allergies.patient_id = target_patient.user_id
    AND allergies.allergen = 'Shellfish'
    AND allergies.is_deleted = false
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
)
INSERT INTO public.vaccinations (
  patient_id,
  vaccine_name,
  dose_number,
  administered_date,
  administered_by,
  next_dose_due
)
SELECT
  target_patient.user_id,
  'Influenza',
  1,
  DATE '2025-10-02',
  'Downtown Family Clinic',
  DATE '2026-10-02'
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.vaccinations vaccinations
  WHERE vaccinations.patient_id = target_patient.user_id
    AND vaccinations.vaccine_name = 'Influenza'
    AND vaccinations.administered_date = DATE '2025-10-02'
    AND vaccinations.is_deleted = false
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
)
INSERT INTO public.vaccinations (
  patient_id,
  vaccine_name,
  dose_number,
  administered_date,
  administered_by,
  next_dose_due
)
SELECT
  target_patient.user_id,
  'COVID-19 Booster',
  3,
  DATE '2025-07-18',
  'Community Vaccination Center',
  NULL
FROM target_patient
WHERE NOT EXISTS (
  SELECT 1
  FROM public.vaccinations vaccinations
  WHERE vaccinations.patient_id = target_patient.user_id
    AND vaccinations.vaccine_name = 'COVID-19 Booster'
    AND vaccinations.administered_date = DATE '2025-07-18'
    AND vaccinations.is_deleted = false
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
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
  TIMESTAMPTZ '2026-01-18 11:30:00+04',
  30,
  'Medication review for diabetes follow-up',
  'Discussed fasting glucose trends, meal timing, and continued tiredness after lunch.'
FROM target_patient
CROSS JOIN target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND appointments.scheduled_at = TIMESTAMPTZ '2026-01-18 11:30:00+04'
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
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
  TIMESTAMPTZ '2026-02-10 09:00:00+04',
  30,
  'Follow-up for blood pressure control and headaches',
  'Patient reports intermittent morning headaches and home blood-pressure readings in the 140s/90s.'
FROM target_patient
CROSS JOIN target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.appointments appointments
  WHERE appointments.patient_id = target_patient.user_id
    AND appointments.doctor_id = target_doctor.user_id
    AND appointments.chief_complaint = 'Follow-up for blood pressure control and headaches'
    AND appointments.scheduled_at = TIMESTAMPTZ '2026-02-10 09:00:00+04'
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
),
target_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  JOIN target_patient ON appointments.patient_id = target_patient.user_id
  JOIN target_doctor ON appointments.doctor_id = target_doctor.user_id
  WHERE appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND appointments.is_deleted = false
  ORDER BY appointments.scheduled_at DESC
  LIMIT 1
)
INSERT INTO public.consultation_notes (
  appointment_id,
  doctor_id,
  subjective,
  objective,
  assessment,
  plan,
  doctor_approved
)
SELECT
  target_appointment.id,
  target_doctor.user_id,
  'Patient reports fasting glucose mostly between 130 and 150 mg/dL and occasional fatigue after heavier meals.',
  'Weight stable. No acute distress. Last home glucose log reviewed in clinic.',
  'Type 2 diabetes with partial control on current regimen.',
  'Continue metformin, reinforce carbohydrate consistency, and repeat HbA1c and lipid panel.',
  true
FROM target_appointment
CROSS JOIN target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.consultation_notes notes
  WHERE notes.appointment_id = target_appointment.id
    AND notes.is_deleted = false
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
),
target_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  JOIN target_patient ON appointments.patient_id = target_patient.user_id
  JOIN target_doctor ON appointments.doctor_id = target_doctor.user_id
  WHERE appointments.chief_complaint = 'Follow-up for blood pressure control and headaches'
    AND appointments.is_deleted = false
  ORDER BY appointments.scheduled_at DESC
  LIMIT 1
)
INSERT INTO public.consultation_notes (
  appointment_id,
  doctor_id,
  subjective,
  objective,
  assessment,
  plan,
  doctor_approved
)
SELECT
  target_appointment.id,
  target_doctor.user_id,
  'Headaches have improved but still happen once or twice weekly. Patient notes better energy on days with consistent hydration.',
  'Clinic blood pressure improved compared with prior visit but remains above target.',
  'Hypertension improving but still needs medication adherence and home monitoring.',
  'Continue losartan, encourage daily readings, reduce sodium intake, and reassess in follow-up.',
  true
FROM target_appointment
CROSS JOIN target_doctor
WHERE NOT EXISTS (
  SELECT 1
  FROM public.consultation_notes notes
  WHERE notes.appointment_id = target_appointment.id
    AND notes.is_deleted = false
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
),
target_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  JOIN target_patient ON appointments.patient_id = target_patient.user_id
  JOIN target_doctor ON appointments.doctor_id = target_doctor.user_id
  WHERE appointments.chief_complaint = 'Follow-up for blood pressure control and headaches'
    AND appointments.is_deleted = false
  ORDER BY appointments.scheduled_at DESC
  LIMIT 1
)
INSERT INTO public.prescriptions (
  patient_id,
  doctor_id,
  appointment_id,
  status,
  prescribed_at
)
SELECT
  target_patient.user_id,
  target_doctor.user_id,
  target_appointment.id,
  'active',
  TIMESTAMPTZ '2026-02-10 09:15:00+04'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN target_appointment
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescriptions prescriptions
  WHERE prescriptions.appointment_id = target_appointment.id
    AND prescriptions.status = 'active'
    AND prescriptions.is_deleted = false
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
),
target_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  JOIN target_patient ON appointments.patient_id = target_patient.user_id
  JOIN target_doctor ON appointments.doctor_id = target_doctor.user_id
  WHERE appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND appointments.is_deleted = false
  ORDER BY appointments.scheduled_at DESC
  LIMIT 1
)
INSERT INTO public.prescriptions (
  patient_id,
  doctor_id,
  appointment_id,
  status,
  prescribed_at
)
SELECT
  target_patient.user_id,
  target_doctor.user_id,
  target_appointment.id,
  'completed',
  TIMESTAMPTZ '2026-01-18 11:45:00+04'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN target_appointment
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescriptions prescriptions
  WHERE prescriptions.appointment_id = target_appointment.id
    AND prescriptions.status = 'completed'
    AND prescriptions.is_deleted = false
);

WITH active_prescription AS (
  SELECT prescriptions.id
  FROM public.prescriptions prescriptions
  JOIN public.appointments appointments ON appointments.id = prescriptions.appointment_id
  JOIN public.user_profiles patient_profiles ON patient_profiles.user_id = prescriptions.patient_id
  WHERE prescriptions.status = 'active'
    AND prescriptions.is_deleted = false
    AND appointments.chief_complaint = 'Follow-up for blood pressure control and headaches'
    AND patient_profiles.role = 'patient'
    AND (
      lower(coalesce(patient_profiles.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(patient_profiles.full_name, '')) = 'patient 1'
    )
  LIMIT 1
)
INSERT INTO public.prescription_items (
  prescription_id,
  medication_name,
  dosage,
  frequency,
  duration,
  quantity,
  instructions,
  is_dispensed
)
SELECT
  active_prescription.id,
  'Losartan',
  '50 mg',
  'Once daily',
  '30 days',
  30,
  'Take in the morning and continue daily home blood-pressure readings.',
  true
FROM active_prescription
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescription_items items
  WHERE items.prescription_id = active_prescription.id
    AND items.medication_name = 'Losartan'
);

WITH active_prescription AS (
  SELECT prescriptions.id
  FROM public.prescriptions prescriptions
  JOIN public.appointments appointments ON appointments.id = prescriptions.appointment_id
  JOIN public.user_profiles patient_profiles ON patient_profiles.user_id = prescriptions.patient_id
  WHERE prescriptions.status = 'active'
    AND prescriptions.is_deleted = false
    AND appointments.chief_complaint = 'Follow-up for blood pressure control and headaches'
    AND patient_profiles.role = 'patient'
    AND (
      lower(coalesce(patient_profiles.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(patient_profiles.full_name, '')) = 'patient 1'
    )
  LIMIT 1
)
INSERT INTO public.prescription_items (
  prescription_id,
  medication_name,
  dosage,
  frequency,
  duration,
  quantity,
  instructions,
  is_dispensed
)
SELECT
  active_prescription.id,
  'Metformin',
  '500 mg',
  'Twice daily',
  '30 days',
  60,
  'Take with breakfast and dinner to reduce stomach upset.',
  false
FROM active_prescription
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescription_items items
  WHERE items.prescription_id = active_prescription.id
    AND items.medication_name = 'Metformin'
);

WITH completed_prescription AS (
  SELECT prescriptions.id
  FROM public.prescriptions prescriptions
  JOIN public.appointments appointments ON appointments.id = prescriptions.appointment_id
  JOIN public.user_profiles patient_profiles ON patient_profiles.user_id = prescriptions.patient_id
  WHERE prescriptions.status = 'completed'
    AND prescriptions.is_deleted = false
    AND appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND patient_profiles.role = 'patient'
    AND (
      lower(coalesce(patient_profiles.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(patient_profiles.full_name, '')) = 'patient 1'
    )
  LIMIT 1
)
INSERT INTO public.prescription_items (
  prescription_id,
  medication_name,
  dosage,
  frequency,
  duration,
  quantity,
  instructions,
  is_dispensed
)
SELECT
  completed_prescription.id,
  'Vitamin D3',
  '2000 IU',
  'Once daily',
  '60 days',
  60,
  'Completed after the winter supplementation course.',
  true
FROM completed_prescription
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescription_items items
  WHERE items.prescription_id = completed_prescription.id
    AND items.medication_name = 'Vitamin D3'
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
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(up.full_name, '')) = 'doctor 1'
      OR lower(coalesce(up.email, '')) = 'doctor1@aryaix.com'
    )
  LIMIT 1
),
target_appointment AS (
  SELECT appointments.id
  FROM public.appointments appointments
  JOIN target_patient ON appointments.patient_id = target_patient.user_id
  JOIN target_doctor ON appointments.doctor_id = target_doctor.user_id
  WHERE appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND appointments.is_deleted = false
  ORDER BY appointments.scheduled_at DESC
  LIMIT 1
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
  target_appointment.id,
  'reviewed',
  TIMESTAMPTZ '2026-01-18 12:00:00+04'
FROM target_patient
CROSS JOIN target_doctor
CROSS JOIN target_appointment
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_orders orders
  WHERE orders.appointment_id = target_appointment.id
    AND orders.is_deleted = false
);

WITH target_lab_order AS (
  SELECT lab_orders.id
  FROM public.lab_orders lab_orders
  JOIN public.appointments appointments ON appointments.id = lab_orders.appointment_id
  JOIN public.user_profiles patient_profiles ON patient_profiles.user_id = lab_orders.patient_id
  WHERE appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND patient_profiles.role = 'patient'
    AND (
      lower(coalesce(patient_profiles.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(patient_profiles.full_name, '')) = 'patient 1'
    )
    AND lab_orders.is_deleted = false
  LIMIT 1
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
  'HbA1c',
  'HBA1C',
  'resulted',
  '7.1',
  '%',
  '4.0 - 5.6',
  true,
  TIMESTAMPTZ '2026-01-19 10:30:00+04'
FROM target_lab_order
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_order_items items
  WHERE items.lab_order_id = target_lab_order.id
    AND items.test_name = 'HbA1c'
);

WITH target_lab_order AS (
  SELECT lab_orders.id
  FROM public.lab_orders lab_orders
  JOIN public.appointments appointments ON appointments.id = lab_orders.appointment_id
  JOIN public.user_profiles patient_profiles ON patient_profiles.user_id = lab_orders.patient_id
  WHERE appointments.chief_complaint = 'Medication review for diabetes follow-up'
    AND patient_profiles.role = 'patient'
    AND (
      lower(coalesce(patient_profiles.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(patient_profiles.full_name, '')) = 'patient 1'
    )
    AND lab_orders.is_deleted = false
  LIMIT 1
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
  'LDL Cholesterol',
  'LDL',
  'resulted',
  '145',
  'mg/dL',
  '< 100',
  true,
  TIMESTAMPTZ '2026-01-19 10:30:00+04'
FROM target_lab_order
WHERE NOT EXISTS (
  SELECT 1
  FROM public.lab_order_items items
  WHERE items.lab_order_id = target_lab_order.id
    AND items.test_name = 'LDL Cholesterol'
);

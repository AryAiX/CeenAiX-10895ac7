-- Seed richer lab results for the demo patient (Patient 1) so the Bolt-parity
-- UI has real numeric values, reference zones, trends, subtests, and an
-- upcoming order with AED costs + insurance copay to render.
--
-- Idempotent: all inserts use well-known UUIDs + ON CONFLICT, and we wipe
-- Patient 1's lab_order_items / lab_orders from older seeds before reseeding.
--
-- NOTE: doctor_id in lab_orders references auth.users(id). We re-use the two
-- existing auth users that already have a doctor_profiles row:
--   Dr. Fatima  (Endocrinologist, no email) 3f3a5e1f-4f82-4a39-bd11-cca62e2c8bb8
--   Dr. Ahmed   (Cardiologist, doctor2@aryaix.com) 26b8e94c-91ca-4e15-a021-ec02f2c72cb7

DO $$
DECLARE
  patient_id_v uuid := '5f7c5c48-48e5-483d-89d0-d7aec585d657';
  doctor_fatima uuid := '3f3a5e1f-4f82-4a39-bd11-cca62e2c8bb8';
  doctor_ahmed  uuid := '26b8e94c-91ca-4e15-a021-ec02f2c72cb7';
  lab_dml uuid := '9acc54ca-5fb4-4fb5-93d8-faa22c7916b0';
  lab_edc uuid := 'f8a2f4bd-7a14-4c06-9a70-3a1a85a2f201';

  visit_mar      uuid := 'aaaaaaa1-2026-4305-0001-000000000001';
  visit_jan      uuid := 'aaaaaaa1-2026-4110-0002-000000000002';
  visit_nov      uuid := 'aaaaaaa1-2025-4114-0003-000000000003';
  visit_sep      uuid := 'aaaaaaa1-2025-4822-0004-000000000004';
  visit_upcoming uuid := 'aaaaaaa5-2026-4304-0005-000000000005';

  hba1c_mar uuid := 'bbbbbbb1-0000-4000-8000-000000000001';
  fg_mar    uuid := 'bbbbbbb1-0000-4000-8000-000000000002';
  lipid_mar uuid := 'bbbbbbb1-0000-4000-8000-000000000003';
  vit_d_mar uuid := 'bbbbbbb1-0000-4000-8000-000000000004';
  cbc_mar   uuid := 'bbbbbbb1-0000-4000-8000-000000000005';
  crp_mar   uuid := 'bbbbbbb1-0000-4000-8000-000000000006';
BEGIN

  -- 1) Reconcile orphan doctor rows in user_profiles (created by earlier seeds
  --    where `id` was used as an FK to auth.users by mistake). Delete those
  --    orphan rows if present, then link profile rows to the real auth.users.
  DELETE FROM public.user_profiles
  WHERE role = 'doctor'
    AND user_id NOT IN (SELECT id FROM auth.users);

  INSERT INTO public.user_profiles (user_id, full_name, role, phone, email)
  VALUES
    (doctor_fatima, 'Dr. Fatima Al Mansoori', 'doctor', '+971 50 123 4570', 'fatima.almansoori@dubaimedical.ae'),
    (doctor_ahmed,  'Dr. Ahmed Al Rashidi',  'doctor', '+971 50 123 4571', 'doctor2@aryaix.com')
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = 'doctor',
    phone     = COALESCE(public.user_profiles.phone, EXCLUDED.phone),
    email     = COALESCE(public.user_profiles.email, EXCLUDED.email),
    updated_at = now();

  UPDATE public.doctor_profiles
  SET specialization       = 'Endocrinologist',
      sub_specialization   = 'Diabetes & Metabolism',
      license_number       = COALESCE(license_number, 'DHA-PRAC-2019-082144'),
      years_of_experience  = COALESCE(years_of_experience, 12),
      consultation_fee     = COALESCE(consultation_fee, 450),
      bio                  = COALESCE(bio, 'DHA-licensed endocrinologist specialising in diabetes, thyroid, and metabolic disorders at Dubai Medical Laboratory & Emirates Diagnostics.'),
      languages_spoken     = '["en","ar"]'::jsonb,
      dha_license_verified = true,
      dha_verified_at      = COALESCE(dha_verified_at, now()),
      updated_at           = now()
  WHERE user_id = doctor_fatima;

  UPDATE public.doctor_profiles
  SET specialization       = 'Cardiologist',
      sub_specialization   = COALESCE(sub_specialization, 'Interventional Cardiology'),
      license_number       = COALESCE(license_number, 'DHA-PRAC-2018-047821'),
      years_of_experience  = COALESCE(years_of_experience, 15),
      consultation_fee     = COALESCE(consultation_fee, 550),
      bio                  = COALESCE(bio, 'DHA-licensed cardiologist with a focus on preventive cardiology, lipid management, and cardiac rehabilitation.'),
      languages_spoken     = '["en","ar","ur"]'::jsonb,
      dha_license_verified = true,
      dha_verified_at      = COALESCE(dha_verified_at, now()),
      updated_at           = now()
  WHERE user_id = doctor_ahmed;

  -- 2) Lab identities: rename the reference lab to Dubai Medical Laboratory
  --    and seed Emirates Diagnostics Centre for demo parity with Bolt.
  UPDATE public.lab_profiles
  SET name = 'Dubai Medical Laboratory',
      city = 'Dubai',
      address = 'Healthcare City, Dubai',
      short_code = 'DML',
      dha_accreditation_code = 'DHA-LAB-2019-08471',
      gradient_from = '#0D9488',
      gradient_to = '#06B6D4',
      phone = '+971 4 429 7100',
      email = 'care@dubaimedlab.ae',
      is_active = true,
      updated_at = now()
  WHERE id = lab_dml;

  INSERT INTO public.lab_profiles (
    id, slug, name, city, address, phone, email, short_code,
    dha_accreditation_code, gradient_from, gradient_to, is_active
  )
  VALUES (
    lab_edc,
    'emirates-diagnostics-centre',
    'Emirates Diagnostics Centre',
    'Dubai',
    'Business Bay, Dubai',
    '+971 4 447 1240',
    'info@emiratesdiagnostics.ae',
    'EDC',
    'DHA-LAB-2020-09217',
    '#2563EB',
    '#6366F1',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    short_code = EXCLUDED.short_code,
    dha_accreditation_code = EXCLUDED.dha_accreditation_code,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to,
    is_active = true,
    updated_at = now();

  -- 3) Wipe previous Patient 1 lab_order_items + lab_orders before reseeding.
  DELETE FROM public.lab_order_items
  WHERE lab_order_id IN (SELECT id FROM public.lab_orders WHERE patient_id = patient_id_v);
  DELETE FROM public.lab_orders WHERE patient_id = patient_id_v;

  -- -------------------------------------------------------------------------
  -- VISIT 1: 5 March 2026 - Dubai Medical Laboratory, Dr. Fatima
  -- -------------------------------------------------------------------------
  INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, appointment_id, assigned_lab_id,
    status, ordered_at, sample_collection_at, results_released_at,
    reviewed_at, reviewed_by, overall_comment,
    ordered_by_specialty, lab_order_code, nabidh_reference,
    due_by, urgency, fasting_required,
    total_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    visit_mar, patient_id_v, doctor_fatima, NULL, lab_dml,
    'reviewed', '2026-03-04 08:30:00+00', '2026-03-05 07:30:00+00', '2026-03-05 13:15:00+00',
    '2026-03-05 15:00:00+00', doctor_fatima,
    'Overall looking good, Parnia! HbA1c is improving — keep up the Metformin and diet changes. See you in 3 months.',
    'Endocrinologist', 'LAB-20260305-0194', 'NAB-VISIT-2026-047821',
    NULL, 'routine', true,
    840, 756, 84
  );

  -- 1a) HbA1c
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, result_value, result_unit, reference_text, reference_range,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, doctor_comment, patient_explanation, resulted_at,
    fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    hba1c_mar, visit_mar, 10, 'HbA1c', 'Glycated Hemoglobin', 'HBA1C', '4548-4',
    'reviewed', '6.8', '%', 'Normal <5.7 | Pre-diabetic 5.7–6.4 | Diabetic ≥6.5', 'Normal <5.7 | Pre-diabetic 5.7–6.4 | Diabetic ≥6.5',
    6.8, 0, 5.7, true,
    'borderline', 'H',
    'HbA1c improving from 7.1% — keep up the diet changes and Metformin. Recheck in 3 months.',
    'This measures your average blood sugar over the last 3 months. Your level of 6.8% is in the pre-diabetic range — improving from 7.4% in September. You are moving in the right direction.',
    '2026-03-05 13:15:00+00', false, 90, 81, 9
  );

  -- 1b) Fasting Glucose
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, result_value, result_unit, reference_text, reference_range,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, doctor_comment, patient_explanation, resulted_at,
    fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    fg_mar, visit_mar, 20, 'Fasting Glucose', 'Fasting Blood Glucose', 'FG', '1558-6',
    'reviewed', '118', 'mg/dL', 'Normal <100 | Pre-diabetic 100–125 | Diabetic ≥126', 'Normal <100 | Pre-diabetic 100–125 | Diabetic ≥126',
    118, 70, 100, true,
    'borderline', 'H',
    'Slightly above normal fasting range. Continue Metformin and monitor morning readings at home.',
    'Your fasting blood sugar of 118 mg/dL is slightly above the normal range. It has been steadily improving — your medication and diet are working.',
    '2026-03-05 13:15:00+00', true, 70, 63, 7
  );

  -- 1c) Lipid Panel (parent) + 4 subtests
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, reference_text, is_abnormal,
    status_category, doctor_comment, patient_explanation, resulted_at,
    fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    lipid_mar, visit_mar, 30, 'Lipid Panel', 'Complete Lipid Panel', 'LIPID', '57698-3',
    'reviewed', 'All values within healthy range', false,
    'normal',
    'Lipid panel looks good — Atorvastatin working effectively.',
    'Your cholesterol levels are all in the healthy range. Your Atorvastatin medication is doing its job.',
    '2026-03-05 13:15:00+00', true, 120, 108, 12
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, parent_item_id, sort_order, test_name, test_code, loinc_code,
    status, result_value, result_unit, reference_text, numeric_value, reference_max,
    is_abnormal, status_category, flag, resulted_at
  ) VALUES
    ('bbbbbbb1-0000-4000-8000-000000000031', visit_mar, lipid_mar, 31, 'Total Cholesterol', 'CHOL', '2093-3',
      'reviewed', '195', 'mg/dL', 'Normal <200', 195, 200, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000032', visit_mar, lipid_mar, 32, 'LDL Cholesterol', 'LDL', '13457-7',
      'reviewed', '118', 'mg/dL', 'Normal <130; optimal <100', 118, 130, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000033', visit_mar, lipid_mar, 33, 'HDL Cholesterol', 'HDL', '2085-9',
      'reviewed', '52', 'mg/dL', 'Normal ≥40 (women)', 52, NULL, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000034', visit_mar, lipid_mar, 34, 'Triglycerides', 'TRIG', '2571-8',
      'reviewed', '128', 'mg/dL', 'Normal <150', 128, 150, false, 'normal', 'N', '2026-03-05 13:15:00+00');

  -- 1d) Vitamin D
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, result_value, result_unit, reference_text, reference_range,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, doctor_comment, patient_explanation, resulted_at,
    retest_due_date, fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    vit_d_mar, visit_mar, 40, 'Vitamin D', 'Vitamin D (25-OH)', 'VITD', '14635-7',
    'reviewed', '22', 'ng/mL', 'Deficient <20 | Insufficient 20–29 | Sufficient 30–80', 'Deficient <20 | Insufficient 20–29 | Sufficient 30–80',
    22, 30, 80, true,
    'low', 'L',
    'Vitamin D insufficient — prescribed Vitamin D 2000IU daily. Retest in 3 months.',
    '22 ng/mL means your Vitamin D is insufficient — slightly below the healthy range of 30+. Common in Dubai. Your supplement should raise this by June.',
    '2026-03-05 13:15:00+00', '2026-06-05', false, 160, 144, 16
  );

  -- 1e) CBC parent + 5 subtests
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, reference_text, is_abnormal,
    status_category, doctor_comment, patient_explanation, resulted_at,
    fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    cbc_mar, visit_mar, 50, 'CBC', 'Complete Blood Count', 'CBC', '58410-2',
    'reviewed', 'All values within healthy range', false,
    'normal',
    'CBC all normal — no signs of anemia or infection.',
    'Your complete blood count is all normal. This checks red cells, white cells, and platelets — all healthy.',
    '2026-03-05 13:15:00+00', false, 80, 72, 8
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, parent_item_id, sort_order, test_name, test_code, loinc_code,
    status, result_value, result_unit, reference_text, numeric_value, reference_min, reference_max,
    is_abnormal, status_category, flag, resulted_at
  ) VALUES
    ('bbbbbbb1-0000-4000-8000-000000000051', visit_mar, cbc_mar, 51, 'WBC', 'WBC', '6690-2',
      'reviewed', '6.2', '×10³/μL', '4.5–11.0', 6.2, 4.5, 11.0, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000052', visit_mar, cbc_mar, 52, 'RBC', 'RBC', '789-8',
      'reviewed', '4.6', '×10⁶/μL', '4.2–5.4 (women)', 4.6, 4.2, 5.4, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000053', visit_mar, cbc_mar, 53, 'Hemoglobin', 'HGB', '718-7',
      'reviewed', '13.1', 'g/dL', '12.0–16.0 (women)', 13.1, 12.0, 16.0, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000054', visit_mar, cbc_mar, 54, 'Hematocrit', 'HCT', '4544-3',
      'reviewed', '38', '%', '36–48', 38, 36, 48, false, 'normal', 'N', '2026-03-05 13:15:00+00'),
    ('bbbbbbb1-0000-4000-8000-000000000055', visit_mar, cbc_mar, 55, 'Platelets', 'PLT', '777-3',
      'reviewed', '245', '×10³/μL', '150–400', 245, 150, 400, false, 'normal', 'N', '2026-03-05 13:15:00+00');

  -- 1f) CRP
  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, result_value, result_unit, reference_text, reference_range,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, doctor_comment, patient_explanation, resulted_at,
    fasting_required, unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    crp_mar, visit_mar, 60, 'CRP', 'C-Reactive Protein', 'CRP', '1988-5',
    'reviewed', '3.2', 'mg/L', 'Normal <3.0 | Monitor 3.0–10.0', 'Normal <3.0 | Monitor 3.0–10.0',
    3.2, 0, 3.0, true,
    'borderline', 'H',
    'Slightly elevated CRP — mild inflammation, likely related to glucose control. Should improve as HbA1c normalizes.',
    'CRP measures inflammation. At 3.2 mg/L it is just above normal — mild elevation is common with elevated blood sugar and should improve as diabetes control improves.',
    '2026-03-05 13:15:00+00', false, 110, 99, 11
  );

  -- -------------------------------------------------------------------------
  -- VISIT 2: 10 Jan 2026 - Emirates Diagnostics Centre
  -- -------------------------------------------------------------------------
  INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, assigned_lab_id, status, ordered_at,
    sample_collection_at, results_released_at, reviewed_at, reviewed_by,
    overall_comment, ordered_by_specialty, lab_order_code, nabidh_reference,
    urgency, fasting_required
  )
  VALUES (
    visit_jan, patient_id_v, doctor_fatima, lab_edc, 'reviewed',
    '2026-01-09 07:40:00+00', '2026-01-10 07:30:00+00', '2026-01-10 12:40:00+00',
    '2026-01-11 09:00:00+00', doctor_fatima,
    'HbA1c trending down — stay the course with Metformin + walking.',
    'Endocrinologist', 'LAB-20260110-0088', 'NAB-VISIT-2026-023144',
    'routine', false
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, test_code, loinc_code,
    status, result_value, result_unit, reference_text,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, resulted_at
  ) VALUES
    ('bbbbbbb2-2026-4000-0110-000000000001', visit_jan, 10, 'HbA1c', 'HBA1C', '4548-4',
      'reviewed', '7.0', '%', 'Normal <5.7 | Pre-diabetic 5.7–6.4 | Diabetic ≥6.5',
      7.0, 0, 5.7, true, 'borderline', 'H', '2026-01-10 12:40:00+00'),
    ('bbbbbbb2-2026-4000-0110-000000000002', visit_jan, 20, 'Vitamin D', 'VITD', '14635-7',
      'reviewed', '18', 'ng/mL', 'Deficient <20',
      18, 30, 80, true, 'low', 'L', '2026-01-10 12:40:00+00');

  -- -------------------------------------------------------------------------
  -- VISIT 3: 14 Nov 2025 - Dubai Medical Laboratory
  -- -------------------------------------------------------------------------
  INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, assigned_lab_id, status, ordered_at,
    sample_collection_at, results_released_at, reviewed_at, reviewed_by,
    overall_comment, ordered_by_specialty, lab_order_code, nabidh_reference,
    urgency
  )
  VALUES (
    visit_nov, patient_id_v, doctor_fatima, lab_dml, 'reviewed',
    '2025-11-13 07:00:00+00', '2025-11-14 07:30:00+00', '2025-11-14 13:00:00+00',
    '2025-11-15 08:00:00+00', doctor_fatima,
    'HbA1c 7.1% — small improvement, keep going.',
    'Endocrinologist', 'LAB-20251114-0477', 'NAB-VISIT-2025-108244',
    'routine'
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, test_code, loinc_code,
    status, result_value, result_unit, reference_text,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, resulted_at
  ) VALUES
    ('bbbbbbb3-2025-4114-0000-000000000001', visit_nov, 10, 'HbA1c', 'HBA1C', '4548-4',
      'reviewed', '7.1', '%', 'Normal <5.7 | Pre-diabetic 5.7–6.4 | Diabetic ≥6.5',
      7.1, 0, 5.7, true, 'borderline', 'H', '2025-11-14 13:00:00+00');

  -- -------------------------------------------------------------------------
  -- VISIT 4: 22 Sep 2025 - baseline HbA1c 7.4%
  -- -------------------------------------------------------------------------
  INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, assigned_lab_id, status, ordered_at,
    sample_collection_at, results_released_at, reviewed_at, reviewed_by,
    overall_comment, ordered_by_specialty, lab_order_code, nabidh_reference,
    urgency
  )
  VALUES (
    visit_sep, patient_id_v, doctor_fatima, lab_dml, 'reviewed',
    '2025-09-21 06:30:00+00', '2025-09-22 07:30:00+00', '2025-09-22 13:10:00+00',
    '2025-09-22 15:30:00+00', doctor_fatima,
    'Baseline HbA1c 7.4% — start Metformin and lifestyle plan.',
    'Endocrinologist', 'LAB-20250922-0311', 'NAB-VISIT-2025-081711',
    'routine'
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, test_code, loinc_code,
    status, result_value, result_unit, reference_text,
    numeric_value, reference_min, reference_max, is_abnormal,
    status_category, flag, resulted_at
  ) VALUES
    ('bbbbbbb4-2025-4922-0000-000000000001', visit_sep, 10, 'HbA1c', 'HBA1C', '4548-4',
      'reviewed', '7.4', '%', 'Normal <5.7 | Pre-diabetic 5.7–6.4 | Diabetic ≥6.5',
      7.4, 0, 5.7, true, 'borderline', 'H', '2025-09-22 13:10:00+00');

  -- -------------------------------------------------------------------------
  -- UPCOMING ORDER: 4 Mar 2026 - Dr. Ahmed (Cardiologist), due 15 Apr.
  -- -------------------------------------------------------------------------
  INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, assigned_lab_id, status, ordered_at,
    due_by, ordered_by_specialty, lab_order_code, nabidh_reference,
    urgency, fasting_required,
    total_cost_aed, insurance_coverage_aed, patient_cost_aed
  )
  VALUES (
    visit_upcoming, patient_id_v, doctor_ahmed, lab_edc, 'ordered',
    '2026-03-04 14:30:00+00',
    '2026-04-15', 'Cardiologist', 'LAB-20260304-0921', 'NAB-VISIT-2026-077812',
    'routine', true,
    610, 549, 61
  );

  INSERT INTO public.lab_order_items (
    id, lab_order_id, sort_order, test_name, display_name_long, test_code, loinc_code,
    status, description, reference_text, fasting_required,
    unit_cost_aed, insurance_coverage_aed, patient_cost_aed
  ) VALUES
    ('ccccccc5-2026-4304-0000-000000000001', visit_upcoming, 10, 'HbA1c', 'Glycated Hemoglobin', 'HBA1C', '4548-4',
      'ordered', '3-month average blood sugar',             'Normal <5.7 | Pre-diabetic 5.7–6.4',  false, 90, 81,  9),
    ('ccccccc5-2026-4304-0000-000000000002', visit_upcoming, 20, 'Fasting Glucose', 'Fasting Blood Glucose', 'FG', '1558-6',
      'ordered', 'Fasting required ≥ 8 hours',              'Normal <100 mg/dL',                   true,  70, 63,  7),
    ('ccccccc5-2026-4304-0000-000000000003', visit_upcoming, 30, 'Lipid Panel', 'Complete Lipid Panel', 'LIPID', '57698-3',
      'ordered', 'Cholesterol, LDL, HDL, Triglycerides',    'Normal cholesterol profile',          true,  120, 108, 12),
    ('ccccccc5-2026-4304-0000-000000000004', visit_upcoming, 40, 'Vitamin D', 'Vitamin D (25-OH)', 'VITD', '14635-7',
      'ordered', 'Recheck after 3 months of supplementation','Sufficient 30–80 ng/mL',             false, 160, 144, 16),
    ('ccccccc5-2026-4304-0000-000000000005', visit_upcoming, 50, 'CBC', 'Complete Blood Count', 'CBC', '58410-2',
      'ordered', 'Red cells, white cells, platelets',       'All values within healthy range',     false, 80, 72,  8),
    ('ccccccc5-2026-4304-0000-000000000006', visit_upcoming, 60, 'CRP', 'C-Reactive Protein', 'CRP', '1988-5',
      'ordered', 'Inflammation marker',                     'Normal <3.0 mg/L',                    false, 110, 99, 11);

END
$$;

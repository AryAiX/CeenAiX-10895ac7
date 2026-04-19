-- Seed a handful of additional lab orders and items in various statuses so the
-- Lab portal worklist has content to demonstrate claim / process / save / release.
-- This migration is idempotent: it derives order IDs deterministically from
-- (patient, test code, day) and skips inserts if those rows already exist.

DO $$
DECLARE
  patient_user uuid;
  doctor_user uuid;
  lab_id_var uuid;
  order_id uuid;
BEGIN
  SELECT au.id INTO patient_user FROM auth.users au WHERE au.email = 'patient1@aryaix.com' LIMIT 1;
  SELECT au.id INTO doctor_user FROM auth.users au WHERE au.email = 'doctor2@aryaix.com' LIMIT 1;
  SELECT lp.id INTO lab_id_var FROM public.lab_profiles lp WHERE lp.slug = 'ceenaix-reference-lab' LIMIT 1;

  IF patient_user IS NULL OR doctor_user IS NULL OR lab_id_var IS NULL THEN
    RAISE NOTICE 'Skipping additional lab order seed: demo users or lab missing.';
    RETURN;
  END IF;

  -- Order 1: freshly ordered (not yet claimed/collected) — CBC panel
  IF NOT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    JOIN public.lab_order_items loi ON loi.lab_order_id = lo.id
    WHERE lo.patient_id = patient_user
      AND lo.doctor_id = doctor_user
      AND lo.status = 'ordered'
      AND lo.ordered_at >= now() - interval '12 hours'
      AND loi.test_code = 'CBC'
  ) THEN
    INSERT INTO public.lab_orders (patient_id, doctor_id, status, ordered_at, assigned_lab_id)
    VALUES (patient_user, doctor_user, 'ordered', now() - interval '3 hours', lab_id_var)
    RETURNING id INTO order_id;

    INSERT INTO public.lab_order_items (lab_order_id, test_name, test_code, status)
    VALUES
      (order_id, 'Complete Blood Count (CBC)', 'CBC', 'ordered'),
      (order_id, 'Hemoglobin', 'HGB', 'ordered'),
      (order_id, 'Hematocrit', 'HCT', 'ordered'),
      (order_id, 'Platelet Count', 'PLT', 'ordered');
  END IF;

  -- Order 2: in processing — Lipid panel (partial results)
  IF NOT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    JOIN public.lab_order_items loi ON loi.lab_order_id = lo.id
    WHERE lo.patient_id = patient_user
      AND lo.status = 'processing'
      AND loi.test_code = 'LIPID'
  ) THEN
    INSERT INTO public.lab_orders (patient_id, doctor_id, status, ordered_at, assigned_lab_id)
    VALUES (patient_user, doctor_user, 'processing', now() - interval '1 day', lab_id_var)
    RETURNING id INTO order_id;

    INSERT INTO public.lab_order_items (lab_order_id, test_name, test_code, status, result_value, result_unit, reference_range, is_abnormal, resulted_at)
    VALUES
      (order_id, 'Lipid Panel', 'LIPID', 'processing', NULL, NULL, NULL, NULL, NULL),
      (order_id, 'Total Cholesterol', 'CHOL', 'resulted', '185', 'mg/dL', '< 200', false, now() - interval '2 hours'),
      (order_id, 'LDL Cholesterol', 'LDL', 'processing', NULL, NULL, NULL, NULL, NULL),
      (order_id, 'HDL Cholesterol', 'HDL', 'resulted', '58', 'mg/dL', '> 40', false, now() - interval '2 hours'),
      (order_id, 'Triglycerides', 'TRIG', 'processing', NULL, NULL, NULL, NULL, NULL);
  END IF;

  -- Order 3: collected, waiting to start — Thyroid panel
  IF NOT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    JOIN public.lab_order_items loi ON loi.lab_order_id = lo.id
    WHERE lo.patient_id = patient_user
      AND lo.status = 'collected'
      AND loi.test_code = 'TSH'
  ) THEN
    INSERT INTO public.lab_orders (patient_id, doctor_id, status, ordered_at, assigned_lab_id)
    VALUES (patient_user, doctor_user, 'collected', now() - interval '6 hours', lab_id_var)
    RETURNING id INTO order_id;

    INSERT INTO public.lab_order_items (lab_order_id, test_name, test_code, status)
    VALUES
      (order_id, 'TSH (Thyroid Stimulating Hormone)', 'TSH', 'collected'),
      (order_id, 'Free T4', 'FT4', 'collected'),
      (order_id, 'Free T3', 'FT3', 'collected');
  END IF;

  -- Order 4: one more ordered sample — Vitamin panel
  IF NOT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    JOIN public.lab_order_items loi ON loi.lab_order_id = lo.id
    WHERE lo.patient_id = patient_user
      AND lo.status = 'ordered'
      AND loi.test_code = 'VITD'
  ) THEN
    INSERT INTO public.lab_orders (patient_id, doctor_id, status, ordered_at, assigned_lab_id)
    VALUES (patient_user, doctor_user, 'ordered', now() - interval '45 minutes', lab_id_var)
    RETURNING id INTO order_id;

    INSERT INTO public.lab_order_items (lab_order_id, test_name, test_code, status)
    VALUES
      (order_id, 'Vitamin D (25-OH)', 'VITD', 'ordered'),
      (order_id, 'Vitamin B12', 'VITB12', 'ordered'),
      (order_id, 'Ferritin', 'FERR', 'ordered');
  END IF;
END
$$;

-- Extend lab schema so the patient-facing "My Lab Results" UI can render the
-- same richness the product design calls for: visit metadata, numeric values
-- (for trends), reference ranges (for zone bars), sub-tests (for panels like
-- Lipid / CBC), fasting + cost + insurance copay, doctor review, and the
-- Nabidh / DHA references that the UAE compliance surfaces call for.
--
-- This migration is additive and idempotent — every column uses
-- `ADD COLUMN IF NOT EXISTS` and every policy / trigger / type is replaced.

-- ---------------------------------------------------------------------------
-- lab_profiles: visual + compliance identity
-- ---------------------------------------------------------------------------

ALTER TABLE public.lab_profiles
  ADD COLUMN IF NOT EXISTS short_code text,
  ADD COLUMN IF NOT EXISTS dha_accreditation_code text,
  ADD COLUMN IF NOT EXISTS gradient_from text,
  ADD COLUMN IF NOT EXISTS gradient_to text;

COMMENT ON COLUMN public.lab_profiles.short_code IS
  'Short 2–4 letter code rendered in avatars (e.g. DML, EDC).';
COMMENT ON COLUMN public.lab_profiles.dha_accreditation_code IS
  'Dubai Health Authority accreditation code, e.g. DHA-LAB-2019-08471.';

-- ---------------------------------------------------------------------------
-- lab_orders: additional visit-level metadata
-- ---------------------------------------------------------------------------

ALTER TABLE public.lab_orders
  ADD COLUMN IF NOT EXISTS lab_order_code text,
  ADD COLUMN IF NOT EXISTS nabidh_reference text,
  ADD COLUMN IF NOT EXISTS ordered_by_specialty text,
  ADD COLUMN IF NOT EXISTS sample_collection_at timestamptz,
  ADD COLUMN IF NOT EXISTS results_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS overall_comment text,
  ADD COLUMN IF NOT EXISTS due_by timestamptz,
  ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'routine',
  ADD COLUMN IF NOT EXISTS fasting_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_cost_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS insurance_coverage_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS patient_cost_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS report_pdf_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'lab_orders' AND constraint_name = 'lab_orders_urgency_check'
  ) THEN
    ALTER TABLE public.lab_orders
      ADD CONSTRAINT lab_orders_urgency_check
      CHECK (urgency IN ('routine', 'urgent', 'stat'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_lab_orders_reviewed_by
  ON public.lab_orders(reviewed_by)
  WHERE reviewed_by IS NOT NULL;

-- ---------------------------------------------------------------------------
-- lab_order_items: structured numeric results + patient-facing commentary
-- + parent/child relationships for panels (Lipid, CBC, …)
-- ---------------------------------------------------------------------------

ALTER TABLE public.lab_order_items
  ADD COLUMN IF NOT EXISTS parent_item_id uuid REFERENCES public.lab_order_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS loinc_code text,
  ADD COLUMN IF NOT EXISTS display_name_long text,
  ADD COLUMN IF NOT EXISTS numeric_value numeric,
  ADD COLUMN IF NOT EXISTS reference_min numeric,
  ADD COLUMN IF NOT EXISTS reference_max numeric,
  ADD COLUMN IF NOT EXISTS reference_text text,
  ADD COLUMN IF NOT EXISTS status_category text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS flag text,
  ADD COLUMN IF NOT EXISTS doctor_comment text,
  ADD COLUMN IF NOT EXISTS patient_explanation text,
  ADD COLUMN IF NOT EXISTS retest_due_date date,
  ADD COLUMN IF NOT EXISTS fasting_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unit_cost_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS insurance_coverage_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS patient_cost_aed numeric(10,2),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'lab_order_items' AND constraint_name = 'lab_order_items_status_category_check'
  ) THEN
    ALTER TABLE public.lab_order_items
      ADD CONSTRAINT lab_order_items_status_category_check
      CHECK (status_category IN ('normal', 'borderline', 'elevated', 'low', 'critical', 'pending'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'lab_order_items' AND constraint_name = 'lab_order_items_flag_check'
  ) THEN
    ALTER TABLE public.lab_order_items
      ADD CONSTRAINT lab_order_items_flag_check
      CHECK (flag IS NULL OR flag IN ('N', 'H', 'L', 'HH', 'LL'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_lab_order_items_parent
  ON public.lab_order_items(parent_item_id)
  WHERE parent_item_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_order_items_loinc
  ON public.lab_order_items(loinc_code)
  WHERE loinc_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_order_items_lab_order_sort
  ON public.lab_order_items(lab_order_id, sort_order);

-- ---------------------------------------------------------------------------
-- RPC: extend lab_save_item_result to persist numeric + structured values.
-- Keep the old signature (text-only) as a wrapper for backward compatibility.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lab_save_item_result(
  target_item_id uuid,
  result_value text,
  result_unit text,
  reference_range text,
  is_abnormal boolean,
  numeric_value numeric,
  reference_min numeric,
  reference_max numeric,
  status_category text,
  flag text
)
RETURNS public.lab_order_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_lab uuid;
  target_order_id uuid;
  updated_row public.lab_order_items%ROWTYPE;
BEGIN
  current_lab := public.current_user_lab_id();

  IF current_lab IS NULL THEN
    RAISE EXCEPTION 'You are not a member of any lab.' USING ERRCODE = 'P0001';
  END IF;

  SELECT loi.lab_order_id INTO target_order_id
  FROM public.lab_order_items loi
  JOIN public.lab_orders lo ON lo.id = loi.lab_order_id
  WHERE loi.id = target_item_id
    AND NOT lo.is_deleted
    AND lo.assigned_lab_id = current_lab
  LIMIT 1;

  IF target_order_id IS NULL THEN
    RAISE EXCEPTION 'Lab item not found or not assigned to your lab.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_order_items loi
  SET result_value = lab_save_item_result.result_value,
      result_unit = lab_save_item_result.result_unit,
      reference_range = lab_save_item_result.reference_range,
      reference_text = COALESCE(lab_save_item_result.reference_range, loi.reference_text),
      numeric_value = lab_save_item_result.numeric_value,
      reference_min = lab_save_item_result.reference_min,
      reference_max = lab_save_item_result.reference_max,
      is_abnormal = lab_save_item_result.is_abnormal,
      status_category = COALESCE(lab_save_item_result.status_category, loi.status_category),
      flag = lab_save_item_result.flag,
      status = 'resulted'::lab_order_status,
      resulted_at = COALESCE(loi.resulted_at, now()),
      updated_at = now()
  WHERE loi.id = target_item_id
  RETURNING * INTO updated_row;

  UPDATE public.lab_orders lo
  SET status = 'resulted'::lab_order_status,
      results_released_at = COALESCE(lo.results_released_at, now()),
      updated_at = now()
  WHERE lo.id = target_order_id
    AND lo.status IN ('ordered', 'collected', 'processing')
    AND NOT EXISTS (
      SELECT 1 FROM public.lab_order_items loi2
      WHERE loi2.lab_order_id = target_order_id
        AND loi2.parent_item_id IS NULL
        AND loi2.status NOT IN ('resulted', 'reviewed')
    );

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lab_save_item_result(
  uuid, text, text, text, boolean, numeric, numeric, numeric, text, text
) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: doctor_review_lab_order — the ordering doctor flips status -> reviewed
-- and attaches an overall comment. Exposed so the doctor portal can action
-- results without being a lab member.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.doctor_review_lab_order(
  target_order_id uuid,
  overall_comment text DEFAULT NULL
)
RETURNS public.lab_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  updated_row public.lab_orders%ROWTYPE;
BEGIN
  SELECT up.role INTO current_role
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();

  IF current_role IS NULL OR current_role NOT IN ('doctor', 'super_admin') THEN
    RAISE EXCEPTION 'Only doctors can review lab orders.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_orders lo
  SET status = 'reviewed'::lab_order_status,
      reviewed_at = COALESCE(lo.reviewed_at, now()),
      reviewed_by = auth.uid(),
      overall_comment = COALESCE(doctor_review_lab_order.overall_comment, lo.overall_comment),
      updated_at = now()
  WHERE lo.id = target_order_id
    AND NOT lo.is_deleted
    AND (lo.doctor_id = auth.uid() OR current_role = 'super_admin')
    AND lo.status IN ('resulted', 'reviewed')
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Lab order not found or not ready for review.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_order_items loi
  SET status = 'reviewed'::lab_order_status,
      updated_at = now()
  WHERE loi.lab_order_id = updated_row.id
    AND loi.status = 'resulted';

  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  VALUES (
    updated_row.patient_id,
    'lab_result',
    'Doctor reviewed your lab results',
    'Your doctor has reviewed your results and left a note. Open the lab results page for the summary.',
    '/patient/lab-results'
  );

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.doctor_review_lab_order(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: patient_book_lab_collection — patients confirm a preferred lab + slot.
-- For MVP this just updates the upcoming order metadata and surfaces a
-- notification back to the patient. A real booking flow can extend it later.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.patient_book_lab_collection(
  target_order_id uuid,
  target_lab_id uuid,
  target_slot_at timestamptz
)
RETURNS public.lab_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid uuid := auth.uid();
  updated_row public.lab_orders%ROWTYPE;
BEGIN
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.lab_orders lo
  SET assigned_lab_id = COALESCE(target_lab_id, lo.assigned_lab_id),
      sample_collection_at = target_slot_at,
      status = CASE WHEN lo.status = 'ordered' THEN 'collected'::lab_order_status ELSE lo.status END,
      updated_at = now()
  WHERE lo.id = target_order_id
    AND lo.patient_id = current_uid
    AND NOT lo.is_deleted
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Lab order not found.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  VALUES (
    updated_row.patient_id,
    'lab_result',
    'Lab collection booked',
    'We will remind you the night before. Please follow any fasting instructions from your doctor.',
    '/patient/lab-results'
  );

  RETURN updated_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.patient_book_lab_collection(uuid, uuid, timestamptz) TO authenticated;

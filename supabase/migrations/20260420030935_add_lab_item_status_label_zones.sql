-- -----------------------------------------------------------------------------
-- Lab item display parity with Bolt reference
-- -----------------------------------------------------------------------------
-- Bolt's Recent Results card relies on four per-test fields that don't yet
-- exist on public.lab_order_items:
--   * status_label    — human-facing pill label ("⚠️ Pre-diabetic")
--   * category_color  — hex accent driving the left border, value text, pill,
--                       range-bar marker, and sub-test category dot
--   * trend_direction — 'improving' | 'worsening' | 'stable' (used by the
--                       trend sidebar so the label is authoritative instead of
--                       inferred client-side)
--   * reference_zones — JSONB array of
--                       [{label, min, max, color}] zones for the multi-band
--                       reference bar (Normal / Pre-diabetic / Diabetic, etc.)
--
-- These are additive columns (nullable) so we never break existing rows or
-- RPCs. The lab_save_item_result RPC signature grows optional params that
-- default to existing values.
-- -----------------------------------------------------------------------------

ALTER TABLE public.lab_order_items
  ADD COLUMN IF NOT EXISTS status_label text,
  ADD COLUMN IF NOT EXISTS category_color text,
  ADD COLUMN IF NOT EXISTS trend_direction text,
  ADD COLUMN IF NOT EXISTS reference_zones jsonb;

-- Sanity constraints so callers can't stuff arbitrary strings into trend_direction.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public'
      AND table_name = 'lab_order_items'
      AND constraint_name = 'lab_order_items_trend_direction_check'
  ) THEN
    ALTER TABLE public.lab_order_items
      ADD CONSTRAINT lab_order_items_trend_direction_check
      CHECK (trend_direction IS NULL
             OR trend_direction IN ('improving', 'worsening', 'stable'));
  END IF;
END
$$;

-- Cheap guard so we don't end up with '#ABC' or '0x…' style colors. Matches
-- both 3-digit and 6-digit lowercase/uppercase hex (with leading '#').
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public'
      AND table_name = 'lab_order_items'
      AND constraint_name = 'lab_order_items_category_color_check'
  ) THEN
    ALTER TABLE public.lab_order_items
      ADD CONSTRAINT lab_order_items_category_color_check
      CHECK (category_color IS NULL
             OR category_color ~ '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Extend lab_save_item_result so laboratory staff can persist the new fields
-- through the existing RPC. Old callers keep working because the new params
-- have defaults. Drop the previous overload first so PostgREST only exposes
-- the 14-arg signature.
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.lab_save_item_result(
  uuid, text, text, text, boolean, numeric, numeric, numeric, text, text
);

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
  flag text,
  status_label text DEFAULT NULL,
  category_color text DEFAULT NULL,
  trend_direction text DEFAULT NULL,
  reference_zones jsonb DEFAULT NULL
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

  SELECT loi.lab_order_id INTO target_order_id
  FROM public.lab_order_items loi
  WHERE loi.id = target_item_id;

  IF target_order_id IS NULL THEN
    RAISE EXCEPTION 'lab_order_item % not found', target_item_id USING ERRCODE = 'P0002';
  END IF;

  IF current_lab IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    WHERE lo.id = target_order_id
      AND lo.assigned_lab_id = current_lab
      AND COALESCE(lo.is_deleted, false) = false
  ) THEN
    RAISE EXCEPTION 'forbidden: lab % cannot update item %', current_lab, target_item_id USING ERRCODE = '42501';
  END IF;

  UPDATE public.lab_order_items loi
  SET
    result_value = lab_save_item_result.result_value,
    result_unit = lab_save_item_result.result_unit,
    reference_range = lab_save_item_result.reference_range,
    reference_text = COALESCE(lab_save_item_result.reference_range, loi.reference_text),
    numeric_value = lab_save_item_result.numeric_value,
    reference_min = lab_save_item_result.reference_min,
    reference_max = lab_save_item_result.reference_max,
    is_abnormal = lab_save_item_result.is_abnormal,
    status_category = COALESCE(lab_save_item_result.status_category, loi.status_category),
    flag = lab_save_item_result.flag,
    status_label = COALESCE(lab_save_item_result.status_label, loi.status_label),
    category_color = COALESCE(lab_save_item_result.category_color, loi.category_color),
    trend_direction = COALESCE(lab_save_item_result.trend_direction, loi.trend_direction),
    reference_zones = COALESCE(lab_save_item_result.reference_zones, loi.reference_zones),
    status = 'resulted',
    resulted_at = COALESCE(loi.resulted_at, now()),
    updated_at = now()
  WHERE loi.id = target_item_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

COMMENT ON COLUMN public.lab_order_items.status_label IS
  'Human-facing status pill label (e.g. "⚠️ Pre-diabetic", "✅ All Normal"). Falls back to generic i18n string when null.';
COMMENT ON COLUMN public.lab_order_items.category_color IS
  'Hex color driving per-test accent (card left border, value text, pill, marker).';
COMMENT ON COLUMN public.lab_order_items.trend_direction IS
  'Authoritative trend direction for the sidebar: improving | worsening | stable.';
COMMENT ON COLUMN public.lab_order_items.reference_zones IS
  'JSONB array of reference bands: [{label, min, max, color}]. Used for the multi-zone range bar.';

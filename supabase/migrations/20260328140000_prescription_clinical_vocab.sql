-- Bilingual reference rows for prescription frequency/duration labels.
-- prescription_items keeps legacy `frequency` / `duration` text; optional `frequency_code` /
-- `duration_code` link here. Rows can be extended by super_admin (or future admin UI).

CREATE TABLE public.prescription_clinical_vocab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('frequency', 'duration')),
  code text NOT NULL,
  label_en text NOT NULL,
  label_ar text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  legacy_match text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prescription_clinical_vocab_category_code_key UNIQUE (category, code)
);

CREATE UNIQUE INDEX prescription_clinical_vocab_legacy_match_idx
  ON public.prescription_clinical_vocab (category, lower(trim(legacy_match)))
  WHERE legacy_match IS NOT NULL AND trim(legacy_match) <> '';

CREATE INDEX prescription_clinical_vocab_category_idx
  ON public.prescription_clinical_vocab (category)
  WHERE is_active = true;

ALTER TABLE public.prescription_clinical_vocab ENABLE ROW LEVEL SECURITY;

-- Reference data: safe for any client that can read prescriptions context
CREATE POLICY "prescription_clinical_vocab_select_authenticated"
  ON public.prescription_clinical_vocab
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "prescription_clinical_vocab_select_anon"
  ON public.prescription_clinical_vocab
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "prescription_clinical_vocab_super_admin_all"
  ON public.prescription_clinical_vocab
  FOR ALL
  TO authenticated
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

ALTER TABLE public.prescription_items
  ADD COLUMN IF NOT EXISTS frequency_code text,
  ADD COLUMN IF NOT EXISTS duration_code text;

COMMENT ON TABLE public.prescription_clinical_vocab IS
  'Localized labels for common prescription frequencies and durations; extend via super_admin or migrations.';
COMMENT ON COLUMN public.prescription_items.frequency_code IS
  'Optional FK-style code matching prescription_clinical_vocab(category=frequency).';
COMMENT ON COLUMN public.prescription_items.duration_code IS
  'Optional FK-style code matching prescription_clinical_vocab(category=duration).';

-- Seed common values (idempotent)
INSERT INTO public.prescription_clinical_vocab (category, code, label_en, label_ar, sort_order, legacy_match)
VALUES
  ('frequency', 'once_daily', 'Once daily', 'مرة يومياً', 10, 'Once daily'),
  ('frequency', 'twice_daily', 'Twice daily', 'مرتان يومياً', 20, 'Twice daily'),
  ('frequency', 'three_times_daily', 'Three times daily', 'ثلاث مرات يومياً', 30, 'Three times daily'),
  ('frequency', 'four_times_daily', 'Four times daily', 'أربع مرات يومياً', 40, 'Four times daily'),
  ('frequency', 'every_12_hours', 'Every 12 hours', 'كل ١٢ ساعة', 50, 'Every 12 hours'),
  ('frequency', 'every_8_hours', 'Every 8 hours', 'كل ٨ ساعات', 60, 'Every 8 hours'),
  ('frequency', 'every_6_hours', 'Every 6 hours', 'كل ٦ ساعات', 70, 'Every 6 hours'),
  ('frequency', 'as_needed', 'As needed', 'حسب الحاجة', 80, 'As needed'),
  ('frequency', 'as_needed_pain', 'As needed for pain', 'حسب الحاجة للألم', 90, 'As needed for pain'),
  ('duration', 'days_7', '7 days', '٧ أيام', 10, '7 days'),
  ('duration', 'days_14', '14 days', '١٤ يوماً', 20, '14 days'),
  ('duration', 'days_30', '30 days', '٣٠ يوماً', 30, '30 days'),
  ('duration', 'days_60', '60 days', '٦٠ يوماً', 40, '60 days'),
  ('duration', 'days_90', '90 days', '٩٠ يوماً', 50, '90 days')
ON CONFLICT (category, code) DO UPDATE SET
  label_en = EXCLUDED.label_en,
  label_ar = EXCLUDED.label_ar,
  sort_order = EXCLUDED.sort_order,
  legacy_match = EXCLUDED.legacy_match,
  updated_at = now();

-- Backfill codes from existing free text
UPDATE public.prescription_items pi
SET frequency_code = v.code
FROM public.prescription_clinical_vocab v
WHERE v.category = 'frequency'
  AND v.legacy_match IS NOT NULL
  AND pi.frequency IS NOT NULL
  AND lower(trim(pi.frequency)) = lower(trim(v.legacy_match))
  AND (pi.frequency_code IS NULL OR pi.frequency_code = v.code);

UPDATE public.prescription_items pi
SET duration_code = v.code
FROM public.prescription_clinical_vocab v
WHERE v.category = 'duration'
  AND v.legacy_match IS NOT NULL
  AND pi.duration IS NOT NULL
  AND lower(trim(pi.duration)) = lower(trim(v.legacy_match))
  AND (pi.duration_code IS NULL OR pi.duration_code = v.code);

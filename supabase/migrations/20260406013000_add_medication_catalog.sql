-- Local medication catalog backed by RxNorm imports plus doctor-submitted
-- suggestions for missing Arabic translations and new medications.

CREATE TABLE public.medication_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('rxnorm', 'custom')),
  source_code text,
  generic_name_en text NOT NULL,
  brand_name_en text,
  display_name_ar text,
  strength text,
  dosage_form text,
  manufacturer text,
  is_active boolean NOT NULL DEFAULT true,
  is_custom boolean NOT NULL DEFAULT false,
  source_updated_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medication_catalog_source_source_code_key UNIQUE (source, source_code)
);

CREATE TABLE public.medication_catalog_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_catalog_id uuid REFERENCES public.medication_catalog(id) ON DELETE SET NULL,
  approved_medication_catalog_id uuid REFERENCES public.medication_catalog(id) ON DELETE SET NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('translation', 'new_medication')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_generic_name_en text,
  proposed_brand_name_en text,
  proposed_display_name_ar text,
  proposed_strength text,
  proposed_dosage_form text,
  proposed_manufacturer text,
  review_notes text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medication_catalog_suggestions_translation_requires_catalog
    CHECK (
      (suggestion_type = 'translation' AND medication_catalog_id IS NOT NULL)
      OR suggestion_type = 'new_medication'
    )
);

ALTER TABLE public.prescription_items
  ADD COLUMN IF NOT EXISTS medication_catalog_id uuid REFERENCES public.medication_catalog(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS medication_catalog_suggestion_id uuid REFERENCES public.medication_catalog_suggestions(id) ON DELETE SET NULL;

CREATE INDEX medication_catalog_active_name_idx
  ON public.medication_catalog (lower(generic_name_en), lower(coalesce(brand_name_en, '')))
  WHERE is_active = true;

CREATE INDEX medication_catalog_display_name_ar_idx
  ON public.medication_catalog (lower(coalesce(display_name_ar, '')))
  WHERE is_active = true;

CREATE INDEX medication_catalog_suggestions_created_by_idx
  ON public.medication_catalog_suggestions (created_by, status, created_at DESC);

CREATE INDEX medication_catalog_suggestions_catalog_idx
  ON public.medication_catalog_suggestions (medication_catalog_id, status, created_at DESC);

CREATE UNIQUE INDEX medication_catalog_pending_translation_per_doctor_idx
  ON public.medication_catalog_suggestions (created_by, medication_catalog_id)
  WHERE suggestion_type = 'translation' AND status = 'pending';

CREATE UNIQUE INDEX medication_catalog_pending_new_medication_per_doctor_idx
  ON public.medication_catalog_suggestions (
    created_by,
    lower(trim(coalesce(proposed_generic_name_en, ''))),
    lower(trim(coalesce(proposed_brand_name_en, '')))
  )
  WHERE suggestion_type = 'new_medication' AND status = 'pending';

CREATE TRIGGER trg_medication_catalog_updated_at
  BEFORE UPDATE ON public.medication_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_medication_catalog_suggestions_updated_at
  BEFORE UPDATE ON public.medication_catalog_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.medication_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_catalog_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medication_catalog_select_authenticated"
  ON public.medication_catalog
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "medication_catalog_super_admin_all"
  ON public.medication_catalog
  FOR ALL
  TO authenticated
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

CREATE POLICY "medication_catalog_suggestions_select_creator_or_admin"
  ON public.medication_catalog_suggestions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR public.is_current_user_super_admin());

CREATE POLICY "medication_catalog_suggestions_doctor_insert"
  ON public.medication_catalog_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'doctor'
    )
  );

CREATE POLICY "medication_catalog_suggestions_doctor_update_own_pending"
  ON public.medication_catalog_suggestions
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending')
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

CREATE POLICY "medication_catalog_suggestions_doctor_delete_own_pending"
  ON public.medication_catalog_suggestions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending');

CREATE POLICY "medication_catalog_suggestions_super_admin_all"
  ON public.medication_catalog_suggestions
  FOR ALL
  TO authenticated
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

COMMENT ON TABLE public.medication_catalog IS
  'Approved medication catalog rows used for local doctor search, seeded from RxNorm or curated by admins.';
COMMENT ON TABLE public.medication_catalog_suggestions IS
  'Doctor-submitted medication suggestions for missing Arabic translations or brand-new medications pending admin review.';
COMMENT ON COLUMN public.prescription_items.medication_catalog_id IS
  'Approved medication catalog row chosen for this prescription item when available.';
COMMENT ON COLUMN public.prescription_items.medication_catalog_suggestion_id IS
  'Doctor-created pending medication suggestion used for this prescription item before admin approval.';

-- Starter catalog rows to make local search useful immediately.
INSERT INTO public.medication_catalog (
  source,
  source_code,
  generic_name_en,
  brand_name_en,
  display_name_ar,
  is_active,
  is_custom,
  last_synced_at
)
VALUES
  ('rxnorm', '235743', 'metformin hydrochloride', NULL, NULL, true, false, now()),
  ('rxnorm', '133008', 'amoxicillin trihydrate', NULL, 'أموكسيسيلين', true, false, now()),
  ('rxnorm', '5640', 'ibuprofen', NULL, 'إيبوبروفين', true, false, now()),
  ('rxnorm', '83367', 'atorvastatin', NULL, 'أتورفاستاتين', true, false, now()),
  ('rxnorm', '161', 'acetaminophen', 'Paracetamol', NULL, true, false, now()),
  ('rxnorm', '104416', 'amlodipine besylate', NULL, NULL, true, false, now()),
  ('rxnorm', '52175', 'losartan', NULL, 'لوسارتان', true, false, now())
ON CONFLICT (source, source_code) DO UPDATE SET
  generic_name_en = EXCLUDED.generic_name_en,
  brand_name_en = EXCLUDED.brand_name_en,
  display_name_ar = EXCLUDED.display_name_ar,
  is_active = EXCLUDED.is_active,
  is_custom = EXCLUDED.is_custom,
  last_synced_at = now(),
  updated_at = now();

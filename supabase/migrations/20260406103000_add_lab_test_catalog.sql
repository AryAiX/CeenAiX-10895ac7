-- Approved lab test catalog backed by curated LOINC imports plus doctor-submitted
-- suggestions for missing Arabic translations and missing tests.

CREATE TABLE public.lab_test_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('loinc', 'custom')),
  source_code text,
  loinc_class text,
  category text,
  display_name_en text NOT NULL,
  display_name_ar text,
  short_name_en text,
  specimen text,
  property text,
  is_panel boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_custom boolean NOT NULL DEFAULT false,
  source_updated_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lab_test_catalog_source_source_code_key UNIQUE (source, source_code)
);

CREATE TABLE public.lab_test_catalog_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_test_catalog_id uuid REFERENCES public.lab_test_catalog(id) ON DELETE SET NULL,
  approved_lab_test_catalog_id uuid REFERENCES public.lab_test_catalog(id) ON DELETE SET NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('translation', 'new_lab_test')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_source_code text,
  proposed_display_name_en text,
  proposed_display_name_ar text,
  proposed_short_name_en text,
  proposed_specimen text,
  proposed_property text,
  proposed_category text,
  proposed_loinc_class text,
  proposed_is_panel boolean NOT NULL DEFAULT false,
  review_notes text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lab_test_catalog_suggestions_translation_requires_catalog
    CHECK (
      (suggestion_type = 'translation' AND lab_test_catalog_id IS NOT NULL)
      OR suggestion_type = 'new_lab_test'
    ),
  CONSTRAINT lab_test_catalog_suggestions_translation_has_arabic
    CHECK (
      suggestion_type <> 'translation'
      OR nullif(trim(coalesce(proposed_display_name_ar, '')), '') IS NOT NULL
    ),
  CONSTRAINT lab_test_catalog_suggestions_new_lab_has_name
    CHECK (
      suggestion_type <> 'new_lab_test'
      OR nullif(trim(coalesce(proposed_display_name_en, '')), '') IS NOT NULL
    )
);

ALTER TABLE public.lab_order_items
  ADD COLUMN IF NOT EXISTS lab_test_catalog_id uuid REFERENCES public.lab_test_catalog(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lab_test_catalog_suggestion_id uuid REFERENCES public.lab_test_catalog_suggestions(id) ON DELETE SET NULL;

CREATE INDEX lab_test_catalog_active_name_idx
  ON public.lab_test_catalog (lower(display_name_en))
  WHERE is_active = true;

CREATE INDEX lab_test_catalog_display_name_ar_idx
  ON public.lab_test_catalog (lower(coalesce(display_name_ar, '')))
  WHERE is_active = true;

CREATE INDEX lab_test_catalog_source_code_idx
  ON public.lab_test_catalog (source_code)
  WHERE source_code IS NOT NULL;

CREATE INDEX lab_test_catalog_category_idx
  ON public.lab_test_catalog (category, is_panel)
  WHERE is_active = true;

CREATE INDEX lab_test_catalog_suggestions_created_by_idx
  ON public.lab_test_catalog_suggestions (created_by, status, created_at DESC);

CREATE INDEX lab_test_catalog_suggestions_catalog_idx
  ON public.lab_test_catalog_suggestions (lab_test_catalog_id, status, created_at DESC);

CREATE UNIQUE INDEX lab_test_catalog_pending_translation_per_doctor_idx
  ON public.lab_test_catalog_suggestions (created_by, lab_test_catalog_id)
  WHERE suggestion_type = 'translation' AND status = 'pending';

CREATE UNIQUE INDEX lab_test_catalog_pending_new_test_per_doctor_idx
  ON public.lab_test_catalog_suggestions (
    created_by,
    lower(trim(coalesce(proposed_display_name_en, ''))),
    lower(trim(coalesce(proposed_source_code, '')))
  )
  WHERE suggestion_type = 'new_lab_test' AND status = 'pending';

CREATE INDEX lab_order_items_lab_test_catalog_id_idx
  ON public.lab_order_items (lab_test_catalog_id)
  WHERE lab_test_catalog_id IS NOT NULL;

CREATE INDEX lab_order_items_lab_test_catalog_suggestion_id_idx
  ON public.lab_order_items (lab_test_catalog_suggestion_id)
  WHERE lab_test_catalog_suggestion_id IS NOT NULL;

CREATE TRIGGER trg_lab_test_catalog_updated_at
  BEFORE UPDATE ON public.lab_test_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_lab_test_catalog_suggestions_updated_at
  BEFORE UPDATE ON public.lab_test_catalog_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_catalog_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_test_catalog_select_authenticated"
  ON public.lab_test_catalog
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "lab_test_catalog_super_admin_all"
  ON public.lab_test_catalog
  FOR ALL
  TO authenticated
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

CREATE POLICY "lab_test_catalog_suggestions_select_creator_or_admin"
  ON public.lab_test_catalog_suggestions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR public.is_current_user_super_admin());

CREATE POLICY "lab_test_catalog_suggestions_doctor_insert"
  ON public.lab_test_catalog_suggestions
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

CREATE POLICY "lab_test_catalog_suggestions_doctor_update_own_pending"
  ON public.lab_test_catalog_suggestions
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending')
  WITH CHECK (
    created_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

CREATE POLICY "lab_test_catalog_suggestions_doctor_delete_own_pending"
  ON public.lab_test_catalog_suggestions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending');

CREATE POLICY "lab_test_catalog_suggestions_super_admin_all"
  ON public.lab_test_catalog_suggestions
  FOR ALL
  TO authenticated
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

COMMENT ON TABLE public.lab_test_catalog IS
  'Approved lab test catalog rows used for local doctor search, seeded from a curated LOINC subset or curated by admins.';
COMMENT ON TABLE public.lab_test_catalog_suggestions IS
  'Doctor-submitted lab test suggestions for missing Arabic translations or brand-new lab tests pending admin review.';
COMMENT ON COLUMN public.lab_order_items.lab_test_catalog_id IS
  'Approved lab test catalog row chosen for this lab order item when available.';
COMMENT ON COLUMN public.lab_order_items.lab_test_catalog_suggestion_id IS
  'Doctor-created pending lab test suggestion used for this lab order item before admin approval.';

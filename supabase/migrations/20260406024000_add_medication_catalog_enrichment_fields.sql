ALTER TABLE public.medication_catalog
  ADD COLUMN IF NOT EXISTS rxnorm_tty text,
  ADD COLUMN IF NOT EXISTS ingredient_name_en text,
  ADD COLUMN IF NOT EXISTS enrichment_status text NOT NULL DEFAULT 'pending'
    CHECK (enrichment_status IN ('pending', 'enriched', 'failed')),
  ADD COLUMN IF NOT EXISTS enrichment_error text,
  ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz;

CREATE INDEX IF NOT EXISTS medication_catalog_enrichment_status_idx
  ON public.medication_catalog (enrichment_status);

UPDATE public.medication_catalog
SET
  enrichment_status = 'enriched',
  last_enriched_at = COALESCE(last_enriched_at, source_updated_at, last_synced_at, now()),
  enrichment_error = NULL
WHERE source = 'custom'
   OR strength IS NOT NULL
   OR dosage_form IS NOT NULL;

UPDATE public.medication_catalog
SET enrichment_status = 'pending'
WHERE enrichment_status IS NULL;

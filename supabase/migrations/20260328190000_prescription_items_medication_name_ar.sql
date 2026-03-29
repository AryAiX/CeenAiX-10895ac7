-- Localized medication display name (Arabic). Canonical prescribing name stays in medication_name (Latin/English).

ALTER TABLE public.prescription_items
  ADD COLUMN IF NOT EXISTS medication_name_ar text;

COMMENT ON COLUMN public.prescription_items.medication_name_ar IS
  'Optional Arabic display label; UI shows with medication_name when locale is non-English.';

-- Demo / common seed names (idempotent backfill for NULL only)
UPDATE public.prescription_items
SET medication_name_ar = CASE trim(medication_name)
  WHEN 'Losartan' THEN 'لوسارتان'
  WHEN 'Metformin' THEN 'ميتفورمين'
  WHEN 'Vitamin D3' THEN 'فيتامين د3'
  ELSE medication_name_ar
END
WHERE trim(medication_name) IN ('Losartan', 'Metformin', 'Vitamin D3')
  AND (medication_name_ar IS NULL OR btrim(medication_name_ar) = '');

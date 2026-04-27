-- Add appealed claims so the insurance dashboard claims breakdown chart is data-backed.

ALTER TABLE public.insurance_claims
  DROP CONSTRAINT IF EXISTS insurance_claims_status_chk;

ALTER TABLE public.insurance_claims
  ADD CONSTRAINT insurance_claims_status_chk
  CHECK (status IN ('submitted', 'under_review', 'approved', 'denied', 'appealed'));

WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'daman-national-health'
)
INSERT INTO public.insurance_claims (
  organization_id,
  external_ref,
  patient_name,
  plan_name,
  provider_name,
  amount_aed,
  status,
  submitted_at
)
SELECT
  org.id,
  'CLM-9006',
  'Fatima Hassan',
  'Silver Plus',
  'Emirates Specialty Hospital',
  39200.00,
  'appealed',
  now() - interval '42 minutes'
FROM org
ON CONFLICT (organization_id, external_ref) DO UPDATE
SET patient_name = EXCLUDED.patient_name,
    plan_name = EXCLUDED.plan_name,
    provider_name = EXCLUDED.provider_name,
    amount_aed = EXCLUDED.amount_aed,
    status = EXCLUDED.status,
    submitted_at = EXCLUDED.submitted_at,
    updated_at = now();

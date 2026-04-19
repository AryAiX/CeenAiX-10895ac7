-- Seed demo lab + admin data so the lab and admin portals have realistic
-- content when the app runs locally and in dev-db. This migration is
-- rerunnable: every INSERT uses ON CONFLICT DO NOTHING / UPDATE, and all
-- auth lookups resolve demo users by email.

-- ---------------------------------------------------------------------------
-- 1. Upsert a primary demo lab ("CeenAiX Reference Laboratory")
-- ---------------------------------------------------------------------------

INSERT INTO public.lab_profiles (slug, name, city, address, phone, email, is_active)
VALUES (
  'ceenaix-reference-lab',
  'CeenAiX Reference Laboratory',
  'Dubai',
  'Dubai Healthcare City, Building 27',
  '+971 4 000 0000',
  'lab1@aryaix.com',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  is_active = true,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. Promote the demo `lab1@aryaix.com` user profile to role = 'lab' if it
--    exists, and attach them to the demo lab via lab_staff.
-- ---------------------------------------------------------------------------

WITH lab_row AS (
  SELECT id FROM public.lab_profiles WHERE slug = 'ceenaix-reference-lab' LIMIT 1
),
target_user AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE lower(coalesce(au.email, '')) = 'lab1@aryaix.com'
     OR lower(coalesce(up.email, '')) = 'lab1@aryaix.com'
  LIMIT 1
)
UPDATE public.user_profiles up
SET role = 'lab',
    full_name = CASE
      WHEN coalesce(up.full_name, '') = '' OR up.full_name ILIKE 'CeenAiX User'
        THEN 'Layla Haddad'
      ELSE up.full_name
    END,
    first_name = CASE
      WHEN coalesce(up.first_name, '') = '' THEN 'Layla' ELSE up.first_name
    END,
    last_name = CASE
      WHEN coalesce(up.last_name, '') = '' THEN 'Haddad' ELSE up.last_name
    END,
    city = CASE WHEN coalesce(up.city, '') = '' THEN 'Dubai' ELSE up.city END,
    profile_completed = true,
    terms_accepted = true,
    updated_at = now()
FROM target_user tu
WHERE up.user_id = tu.user_id;

WITH lab_row AS (
  SELECT id FROM public.lab_profiles WHERE slug = 'ceenaix-reference-lab' LIMIT 1
),
target_user AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE lower(coalesce(au.email, '')) = 'lab1@aryaix.com'
     OR lower(coalesce(up.email, '')) = 'lab1@aryaix.com'
  LIMIT 1
)
INSERT INTO public.lab_staff (user_id, lab_id, role_label, is_active)
SELECT tu.user_id, lr.id, 'pathologist', true
FROM target_user tu, lab_row lr
WHERE tu.user_id IS NOT NULL
ON CONFLICT (user_id, lab_id) DO UPDATE SET
  is_active = true,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 3. Route all unassigned lab orders into the demo lab so the worklist has
--    content. Only touches orders that are still 'ordered' so we don't
--    disturb doctor-reviewed results from other seeds.
-- ---------------------------------------------------------------------------

WITH lab_row AS (
  SELECT id FROM public.lab_profiles WHERE slug = 'ceenaix-reference-lab' LIMIT 1
)
UPDATE public.lab_orders lo
SET assigned_lab_id = lr.id,
    updated_at = now()
FROM lab_row lr
WHERE lo.assigned_lab_id IS NULL
  AND NOT lo.is_deleted
  AND lo.status IN ('ordered', 'collected', 'processing');

-- ---------------------------------------------------------------------------
-- 4. Seed a couple of demo organizations so /admin/organizations has rows.
-- ---------------------------------------------------------------------------

INSERT INTO public.organizations (slug, name, kind, city, country, primary_contact_name, primary_contact_email, baa_signed_at, contract_started_at, contract_ends_at, seats_allocated, seats_used, status)
VALUES
  (
    'dubai-healthcare-city',
    'Dubai Healthcare City',
    'hospital',
    'Dubai',
    'AE',
    'Ms. Huda Al Mazroui',
    'partnerships@dhcc.ae',
    now() - interval '120 days',
    now() - interval '90 days',
    now() + interval '275 days',
    120,
    76,
    'active'
  ),
  (
    'al-noor-medical-center',
    'Al Noor Medical Center',
    'clinic',
    'Abu Dhabi',
    'AE',
    'Dr. Faisal Al Marri',
    'admin@alnoormc.ae',
    now() - interval '45 days',
    now() - interval '30 days',
    now() + interval '335 days',
    40,
    22,
    'active'
  ),
  (
    'ceenaix-reference-lab-org',
    'CeenAiX Reference Laboratory',
    'lab',
    'Dubai',
    'AE',
    'Ms. Layla Haddad',
    'lab1@aryaix.com',
    now() - interval '60 days',
    now() - interval '50 days',
    now() + interval '315 days',
    8,
    4,
    'active'
  ),
  (
    'careplus-pharmacy',
    'CarePlus Pharmacy Network',
    'pharmacy',
    'Sharjah',
    'AE',
    'Mr. Omar Haddad',
    'ops@careplus.ae',
    NULL,
    NULL,
    NULL,
    20,
    0,
    'pending'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  primary_contact_name = EXCLUDED.primary_contact_name,
  primary_contact_email = EXCLUDED.primary_contact_email,
  seats_allocated = EXCLUDED.seats_allocated,
  seats_used = EXCLUDED.seats_used,
  status = EXCLUDED.status,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 5. Seed feature flags for the diagnostics surface.
-- ---------------------------------------------------------------------------

INSERT INTO public.feature_flags (key, name, description, environment, is_enabled, rollout_percent)
VALUES
  ('lab_portal',              'Lab portal',                     'Expose /lab/* routes and lab dashboards.', 'production', true,  100),
  ('admin_ai_analytics',      'Admin AI analytics',             'Show AI analytics page in the admin portal.', 'production', true,  100),
  ('telemedicine_consult',    'Telemedicine consultations',     'Enable Phase 2 telemedicine consultation workspace.', 'production', false, 0),
  ('patient_imaging_portal',  'Patient imaging portal',         'Show imaging studies + radiology reports to patients.', 'production', false, 0),
  ('pharmacy_portal',         'Pharmacy portal',                'Expose /pharmacy/* dispensing and inventory pages.', 'production', false, 0),
  ('insurance_portal',        'Insurance portal',               'Expose the /insurance/portal browse surface.', 'production', true,  100)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  environment = EXCLUDED.environment,
  is_enabled = EXCLUDED.is_enabled,
  rollout_percent = EXCLUDED.rollout_percent,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 6. Seed a few service health snapshots so /admin/system-health has content.
-- ---------------------------------------------------------------------------

INSERT INTO public.service_health_snapshots (service_key, service_name, category, status, latency_ms, region, message)
VALUES
  ('supabase_db',           'Supabase Postgres',      'core',        'healthy',  18, 'me-central-1', 'All replicas healthy'),
  ('supabase_auth',         'Supabase Auth',          'core',        'healthy',  42, 'me-central-1', 'Sign-in success rate 99.9%'),
  ('supabase_storage',      'Supabase Storage',       'core',        'healthy',  55, 'me-central-1', 'No blocked uploads'),
  ('edge_functions',        'Edge Functions',         'core',        'healthy',  78, 'me-central-1', 'P95 latency 210ms'),
  ('openai_gpt4',           'OpenAI (GPT-4 class)',   'ai',          'healthy', 820, 'global',       'Consumption nominal'),
  ('openai_embeddings',     'OpenAI embeddings',      'ai',          'healthy', 230, 'global',       'Embedding throughput nominal'),
  ('dha_provider_directory','DHA provider directory', 'integration', 'degraded', 540, 'me-central-1', 'Intermittent timeouts from regulator API'),
  ('daman_insurance',       'Daman eligibility',      'integration', 'healthy', 260, 'me-central-1', 'Eligibility checks within SLA')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. Seed an open compliance incident so /admin/compliance surfaces data.
-- ---------------------------------------------------------------------------

INSERT INTO public.admin_incidents (title, summary, severity, status, detected_at, affected_records, regulator_reported, metadata)
VALUES (
  'DHA directory API intermittent timeouts',
  'The DHA provider directory integration is returning 504 timeouts for ~3% of requests. No PHI impact. Retries are masking the issue at application level; engineering is adding circuit breakers.',
  'medium',
  'investigating',
  now() - interval '2 days',
  0,
  false,
  jsonb_build_object('integration', 'dha_provider_directory', 'error_rate', 0.03)
)
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_incidents (title, summary, severity, status, detected_at, resolved_at, affected_records, regulator_reported, metadata)
VALUES (
  'Scheduled storage maintenance — 2026-03-30',
  'Completed Supabase storage maintenance window. No PHI loss, uploads paused for 4 minutes. Customer communication sent.',
  'low',
  'closed',
  now() - interval '14 days',
  now() - interval '14 days' + interval '5 minutes',
  0,
  false,
  jsonb_build_object('vendor', 'supabase', 'window_minutes', 4)
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. Seed platform_settings entries the admin dashboard reads.
-- ---------------------------------------------------------------------------

INSERT INTO public.platform_settings (key, value)
VALUES
  ('platform.branding',        jsonb_build_object('product', 'CeenAiX', 'locale_default', 'en', 'locales', jsonb_build_array('en', 'ar'))),
  ('platform.regions.primary', jsonb_build_object('primary', 'me-central-1', 'failover', 'eu-west-1')),
  ('platform.ai.provider',     jsonb_build_object('default', 'openai', 'model', 'gpt-4o', 'fallback', 'gpt-4o-mini'))
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 9. Seed a pair of audit_log entries so the compliance surface has rows
--    (idempotent: only insert if no recent seed rows exist).
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  seed_count int;
  seed_admin_user uuid;
BEGIN
  SELECT count(*) INTO seed_count
  FROM public.audit_logs
  WHERE table_name = 'seed' AND created_at > now() - interval '1 day';

  IF seed_count = 0 THEN
    SELECT up.user_id INTO seed_admin_user
    FROM public.user_profiles up
    LEFT JOIN auth.users au ON au.id = up.user_id
    WHERE up.role = 'super_admin'
    ORDER BY up.created_at ASC
    LIMIT 1;

    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_value)
    VALUES
      (seed_admin_user, 'create', 'seed', gen_random_uuid(), jsonb_build_object('message', 'seeded demo organizations')),
      (seed_admin_user, 'update', 'seed', gen_random_uuid(), jsonb_build_object('message', 'seeded demo service health snapshots')),
      (seed_admin_user, 'access', 'seed', gen_random_uuid(), jsonb_build_object('message', 'demo admin metrics bootstrap'));
  END IF;
END
$$;

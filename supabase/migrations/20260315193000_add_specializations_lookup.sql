-- Canonical specialization lookup and doctor-to-specialization mapping.
--
-- This keeps a normalized list for searchable multiselect UI while preserving
-- the existing doctor_profiles.specialization field as the primary specialty
-- for legacy reads.

CREATE TABLE IF NOT EXISTS public.specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT specializations_slug_unique UNIQUE (slug),
  CONSTRAINT specializations_name_unique UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.doctor_specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization_id uuid NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT doctor_specializations_unique UNIQUE (doctor_user_id, specialization_id)
);

CREATE INDEX IF NOT EXISTS idx_specializations_category ON public.specializations(category);
CREATE INDEX IF NOT EXISTS idx_specializations_sort_order ON public.specializations(sort_order);
CREATE INDEX IF NOT EXISTS idx_doctor_specializations_doctor_user_id
  ON public.doctor_specializations(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specializations_specialization_id
  ON public.doctor_specializations(specialization_id);

DROP TRIGGER IF EXISTS trg_specializations_updated_at ON public.specializations;
CREATE TRIGGER trg_specializations_updated_at
  BEFORE UPDATE ON public.specializations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_doctor_specializations_updated_at ON public.doctor_specializations;
CREATE TRIGGER trg_doctor_specializations_updated_at
  BEFORE UPDATE ON public.doctor_specializations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_specializations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_specializations" ON public.specializations;
CREATE POLICY "authenticated_read_specializations"
  ON public.specializations
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "anon_read_specializations" ON public.specializations;
CREATE POLICY "anon_read_specializations"
  ON public.specializations
  FOR SELECT
  USING (auth.role() = 'anon');

DROP POLICY IF EXISTS "super_admin_manage_specializations" ON public.specializations;
CREATE POLICY "super_admin_manage_specializations"
  ON public.specializations
  FOR ALL
  USING (public.is_current_user_super_admin())
  WITH CHECK (public.is_current_user_super_admin());

DROP POLICY IF EXISTS "doctors_manage_own_specializations" ON public.doctor_specializations;
CREATE POLICY "doctors_manage_own_specializations"
  ON public.doctor_specializations
  FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

DROP POLICY IF EXISTS "authenticated_read_doctor_specializations" ON public.doctor_specializations;
CREATE POLICY "authenticated_read_doctor_specializations"
  ON public.doctor_specializations
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "anon_read_doctor_specializations" ON public.doctor_specializations;
CREATE POLICY "anon_read_doctor_specializations"
  ON public.doctor_specializations
  FOR SELECT
  USING (auth.role() = 'anon');

INSERT INTO public.specializations (slug, name, category, sort_order)
VALUES
  ('general-practice', 'General Practice', 'Primary Care', 10),
  ('family-medicine', 'Family Medicine', 'Primary Care', 20),
  ('internal-medicine', 'Internal Medicine', 'Primary Care', 30),
  ('pediatrics', 'Pediatrics', 'Primary Care', 40),
  ('emergency-medicine', 'Emergency Medicine', 'Primary Care', 50),
  ('geriatric-medicine', 'Geriatric Medicine', 'Primary Care', 60),
  ('preventive-medicine', 'Preventive Medicine', 'Primary Care', 70),
  ('occupational-medicine', 'Occupational Medicine', 'Primary Care', 80),
  ('critical-care-medicine', 'Critical Care Medicine', 'Primary Care', 90),
  ('palliative-medicine', 'Palliative Medicine', 'Primary Care', 100),
  ('allergy-and-immunology', 'Allergy and Immunology', 'Medical Specialty', 110),
  ('anesthesiology', 'Anesthesiology', 'Medical Specialty', 120),
  ('cardiology', 'Cardiology', 'Medical Specialty', 130),
  ('clinical-genetics', 'Clinical Genetics', 'Medical Specialty', 140),
  ('clinical-neurophysiology', 'Clinical Neurophysiology', 'Medical Specialty', 150),
  ('clinical-pharmacology', 'Clinical Pharmacology', 'Medical Specialty', 160),
  ('dermatology', 'Dermatology', 'Medical Specialty', 170),
  ('endocrinology', 'Endocrinology', 'Medical Specialty', 180),
  ('gastroenterology', 'Gastroenterology', 'Medical Specialty', 190),
  ('hematology', 'Hematology', 'Medical Specialty', 200),
  ('hepatology', 'Hepatology', 'Medical Specialty', 210),
  ('infectious-disease', 'Infectious Disease', 'Medical Specialty', 220),
  ('medical-oncology', 'Medical Oncology', 'Medical Specialty', 230),
  ('nephrology', 'Nephrology', 'Medical Specialty', 240),
  ('neurology', 'Neurology', 'Medical Specialty', 250),
  ('nuclear-medicine', 'Nuclear Medicine', 'Medical Specialty', 260),
  ('pain-medicine', 'Pain Medicine', 'Medical Specialty', 270),
  ('physical-medicine-and-rehabilitation', 'Physical Medicine and Rehabilitation', 'Medical Specialty', 280),
  ('psychiatry', 'Psychiatry', 'Medical Specialty', 290),
  ('pulmonology', 'Pulmonology', 'Medical Specialty', 300),
  ('radiation-oncology', 'Radiation Oncology', 'Medical Specialty', 310),
  ('radiology', 'Radiology', 'Medical Specialty', 320),
  ('rheumatology', 'Rheumatology', 'Medical Specialty', 330),
  ('sleep-medicine', 'Sleep Medicine', 'Medical Specialty', 340),
  ('sports-medicine', 'Sports Medicine', 'Medical Specialty', 350),
  ('pathology', 'Diagnostics', 'Diagnostic Specialty', 360),
  ('interventional-cardiology', 'Interventional Cardiology', 'Diagnostic Specialty', 370),
  ('interventional-radiology', 'Interventional Radiology', 'Diagnostic Specialty', 380),
  ('reproductive-medicine', 'Reproductive Medicine', 'Women and Reproductive Health', 390),
  ('obstetrics-and-gynecology', 'Obstetrics and Gynecology', 'Women and Reproductive Health', 400),
  ('neonatology', 'Neonatology', 'Pediatric Subspecialty', 410),
  ('pediatric-cardiology', 'Pediatric Cardiology', 'Pediatric Subspecialty', 420),
  ('pediatric-endocrinology', 'Pediatric Endocrinology', 'Pediatric Subspecialty', 430),
  ('pediatric-gastroenterology', 'Pediatric Gastroenterology', 'Pediatric Subspecialty', 440),
  ('pediatric-hematology-and-oncology', 'Pediatric Hematology and Oncology', 'Pediatric Subspecialty', 450),
  ('pediatric-nephrology', 'Pediatric Nephrology', 'Pediatric Subspecialty', 460),
  ('pediatric-neurology', 'Pediatric Neurology', 'Pediatric Subspecialty', 470),
  ('pediatric-pulmonology', 'Pediatric Pulmonology', 'Pediatric Subspecialty', 480),
  ('cardiothoracic-surgery', 'Cardiothoracic Surgery', 'Surgical Specialty', 490),
  ('colorectal-surgery', 'Colorectal Surgery', 'Surgical Specialty', 500),
  ('general-surgery', 'General Surgery', 'Surgical Specialty', 510),
  ('neurosurgery', 'Neurosurgery', 'Surgical Specialty', 520),
  ('ophthalmology', 'Ophthalmology', 'Surgical Specialty', 530),
  ('oral-and-maxillofacial-surgery', 'Oral and Maxillofacial Surgery', 'Surgical Specialty', 540),
  ('orthopedic-surgery', 'Orthopedic Surgery', 'Surgical Specialty', 550),
  ('otolaryngology', 'Otolaryngology (ENT)', 'Surgical Specialty', 560),
  ('plastic-surgery', 'Plastic Surgery', 'Surgical Specialty', 570),
  ('thoracic-surgery', 'Thoracic Surgery', 'Surgical Specialty', 580),
  ('transplant-surgery', 'Transplant Surgery', 'Surgical Specialty', 590),
  ('trauma-surgery', 'Trauma Surgery', 'Surgical Specialty', 600),
  ('urology', 'Urology', 'Surgical Specialty', 610),
  ('vascular-surgery', 'Vascular Surgery', 'Surgical Specialty', 620),
  ('dentistry', 'Dentistry', 'Dental Specialty', 630),
  ('orthodontics', 'Orthodontics', 'Dental Specialty', 640),
  ('periodontics', 'Periodontics', 'Dental Specialty', 650),
  ('prosthodontics', 'Prosthodontics', 'Dental Specialty', 660),
  ('endodontics', 'Endodontics', 'Dental Specialty', 670)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();

WITH legacy_specialization_names AS (
  SELECT
    dp.user_id AS doctor_user_id,
    trim(value) AS specialization_name
  FROM public.doctor_profiles dp,
  LATERAL unnest(
    ARRAY_REMOVE(
      ARRAY[
        NULLIF(dp.specialization, ''),
        NULLIF(dp.sub_specialization, '')
      ],
      NULL
    )
  ) AS value
),
matched_specializations AS (
  SELECT DISTINCT
    legacy.doctor_user_id,
    specialization.id AS specialization_id
  FROM legacy_specialization_names legacy
  JOIN public.specializations specialization
    ON lower(legacy.specialization_name) = lower(specialization.name)
)
INSERT INTO public.doctor_specializations (doctor_user_id, specialization_id)
SELECT doctor_user_id, specialization_id
FROM matched_specializations
ON CONFLICT (doctor_user_id, specialization_id) DO NOTHING;

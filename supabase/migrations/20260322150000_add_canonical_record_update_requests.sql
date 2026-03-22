-- Canonical record update review queue and patient-reported medications.

DO $$
BEGIN
  CREATE TYPE patient_canonical_update_source_kind AS ENUM ('pre_visit_assessment', 'ai_chat_message');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE patient_canonical_update_status AS ENUM ('pending', 'applied', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE patient_canonical_update_strategy AS ENUM (
    'user_profile_scalar',
    'patient_profile_scalar',
    'patient_profile_emergency_contact',
    'medical_conditions_replace',
    'allergies_replace',
    'patient_reported_medications_replace'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE patient_reported_medication_review_status AS ENUM ('pending_review', 'reviewed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE patient_canonical_update_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_kind patient_canonical_update_source_kind NOT NULL,
  source_record_id uuid NOT NULL,
  target_field text NOT NULL,
  display_label text NOT NULL,
  apply_strategy patient_canonical_update_strategy NOT NULL,
  current_value jsonb NOT NULL DEFAULT 'null'::jsonb,
  proposed_value jsonb NOT NULL DEFAULT 'null'::jsonb,
  status patient_canonical_update_status NOT NULL DEFAULT 'pending',
  requires_doctor_review boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  confirmed_at timestamptz,
  applied_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_canonical_update_requests_source_unique UNIQUE (source_kind, source_record_id, target_field)
);

CREATE TABLE patient_reported_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_update_request_id uuid REFERENCES patient_canonical_update_requests(id) ON DELETE SET NULL,
  medication_name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  review_status patient_reported_medication_review_status NOT NULL DEFAULT 'pending_review',
  is_current boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_canonical_update_requests_patient_status
  ON patient_canonical_update_requests(patient_id, status, created_at DESC);

CREATE INDEX idx_patient_canonical_update_requests_source
  ON patient_canonical_update_requests(source_kind, source_record_id);

CREATE INDEX idx_patient_reported_medications_patient_current
  ON patient_reported_medications(patient_id, is_current, is_deleted, created_at DESC);

CREATE TRIGGER trg_patient_canonical_update_requests_updated_at
  BEFORE UPDATE ON patient_canonical_update_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patient_reported_medications_updated_at
  BEFORE UPDATE ON patient_reported_medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE patient_canonical_update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reported_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_manage_own_canonical_update_requests" ON patient_canonical_update_requests
  FOR ALL USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "doctors_read_canonical_update_requests_via_appointments" ON patient_canonical_update_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM appointments
      WHERE appointments.patient_id = patient_canonical_update_requests.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

CREATE POLICY "patients_manage_own_reported_medications" ON patient_reported_medications
  FOR ALL USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "doctors_read_reported_medications_via_appointments" ON patient_reported_medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM appointments
      WHERE appointments.patient_id = patient_reported_medications.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

CREATE OR REPLACE FUNCTION apply_patient_canonical_update_requests(p_request_ids uuid[])
RETURNS TABLE (id uuid, status patient_canonical_update_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record patient_canonical_update_requests%ROWTYPE;
  current_user_id uuid;
  scalar_value text;
  emergency_name text;
  emergency_phone text;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.';
  END IF;

  FOR request_record IN
    SELECT *
    FROM patient_canonical_update_requests
    WHERE id = ANY(p_request_ids)
      AND patient_id = current_user_id
      AND status = 'pending'
    ORDER BY created_at
  LOOP
    CASE request_record.apply_strategy
      WHEN 'user_profile_scalar' THEN
        scalar_value := NULLIF(request_record.proposed_value ->> 'value', '');

        UPDATE user_profiles
        SET
          full_name = CASE WHEN request_record.target_field = 'profile.full_name' THEN COALESCE(scalar_value, full_name) ELSE full_name END,
          date_of_birth = CASE
            WHEN request_record.target_field = 'profile.date_of_birth' AND scalar_value IS NOT NULL THEN scalar_value::date
            WHEN request_record.target_field = 'profile.date_of_birth' THEN NULL
            ELSE date_of_birth
          END,
          gender = CASE WHEN request_record.target_field = 'profile.gender' THEN scalar_value ELSE gender END,
          address = CASE WHEN request_record.target_field = 'profile.address' THEN scalar_value ELSE address END,
          phone = CASE WHEN request_record.target_field = 'profile.phone' THEN scalar_value ELSE phone END,
          city = CASE WHEN request_record.target_field = 'profile.city' THEN scalar_value ELSE city END
        WHERE user_id = current_user_id;

      WHEN 'patient_profile_scalar' THEN
        scalar_value := NULLIF(request_record.proposed_value ->> 'value', '');

        INSERT INTO patient_profiles (
          user_id,
          blood_type,
          emergency_contact_name,
          emergency_contact_phone
        )
        VALUES (
          current_user_id,
          CASE WHEN request_record.target_field = 'patient.blood_type' THEN scalar_value ELSE NULL END,
          NULL,
          NULL
        )
        ON CONFLICT (user_id) DO UPDATE
        SET blood_type = CASE
          WHEN request_record.target_field = 'patient.blood_type' THEN EXCLUDED.blood_type
          ELSE patient_profiles.blood_type
        END;

      WHEN 'patient_profile_emergency_contact' THEN
        emergency_name := NULLIF(trim(COALESCE(request_record.proposed_value ->> 'name', '')), '');
        emergency_phone := NULLIF(trim(COALESCE(request_record.proposed_value ->> 'phone', '')), '');

        INSERT INTO patient_profiles (
          user_id,
          blood_type,
          emergency_contact_name,
          emergency_contact_phone
        )
        VALUES (
          current_user_id,
          NULL,
          emergency_name,
          emergency_phone
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
          emergency_contact_name = COALESCE(EXCLUDED.emergency_contact_name, patient_profiles.emergency_contact_name),
          emergency_contact_phone = COALESCE(EXCLUDED.emergency_contact_phone, patient_profiles.emergency_contact_phone);

      WHEN 'medical_conditions_replace' THEN
        UPDATE medical_conditions
        SET
          is_deleted = true,
          deleted_at = now()
        WHERE patient_id = current_user_id
          AND is_deleted = false
          AND status IN ('active', 'chronic');

        INSERT INTO medical_conditions (
          patient_id,
          condition_name,
          status,
          notes
        )
        SELECT
          current_user_id,
          condition_name,
          'active'::condition_status,
          'Patient-confirmed update'
        FROM (
          SELECT DISTINCT NULLIF(trim(value), '') AS condition_name
          FROM jsonb_array_elements_text(COALESCE(request_record.proposed_value -> 'values', '[]'::jsonb)) AS value
        ) AS normalized_conditions
        WHERE condition_name IS NOT NULL;

      WHEN 'allergies_replace' THEN
        UPDATE allergies
        SET
          is_deleted = true,
          deleted_at = now()
        WHERE patient_id = current_user_id
          AND is_deleted = false;

        INSERT INTO allergies (
          patient_id,
          allergen,
          severity,
          reaction,
          confirmed_by_doctor
        )
        SELECT
          current_user_id,
          allergen,
          'mild'::allergy_severity,
          NULL,
          false
        FROM (
          SELECT DISTINCT NULLIF(trim(value), '') AS allergen
          FROM jsonb_array_elements_text(COALESCE(request_record.proposed_value -> 'values', '[]'::jsonb)) AS value
        ) AS normalized_allergies
        WHERE allergen IS NOT NULL;

      WHEN 'patient_reported_medications_replace' THEN
        UPDATE patient_reported_medications
        SET
          is_current = false,
          is_deleted = true,
          deleted_at = now()
        WHERE patient_id = current_user_id
          AND is_current = true
          AND is_deleted = false;

        INSERT INTO patient_reported_medications (
          patient_id,
          source_update_request_id,
          medication_name,
          review_status,
          is_current,
          is_deleted
        )
        SELECT
          current_user_id,
          request_record.id,
          medication_name,
          'pending_review'::patient_reported_medication_review_status,
          true,
          false
        FROM (
          SELECT DISTINCT NULLIF(trim(value), '') AS medication_name
          FROM jsonb_array_elements_text(COALESCE(request_record.proposed_value -> 'values', '[]'::jsonb)) AS value
        ) AS normalized_medications
        WHERE medication_name IS NOT NULL;
    END CASE;

    UPDATE patient_canonical_update_requests
    SET
      status = 'applied',
      confirmed_at = COALESCE(confirmed_at, now()),
      applied_at = now(),
      dismissed_at = NULL
    WHERE patient_canonical_update_requests.id = request_record.id;

    id := request_record.id;
    status := 'applied';
    RETURN NEXT;
  END LOOP;
END;
$$;

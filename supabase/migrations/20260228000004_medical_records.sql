-- Medical Records: conditions, allergies, vaccinations

CREATE TABLE medical_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  condition_name text NOT NULL,
  icd_code text,
  diagnosed_date date,
  status condition_status NOT NULL DEFAULT 'active',
  notes text,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  allergen text NOT NULL,
  severity allergy_severity NOT NULL DEFAULT 'mild',
  reaction text,
  confirmed_by_doctor boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  vaccine_name text NOT NULL,
  dose_number integer,
  administered_date date,
  administered_by text,
  next_dose_due date,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_medical_conditions_patient ON medical_conditions(patient_id);
CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_vaccinations_patient ON vaccinations(patient_id);

-- Triggers
CREATE TRIGGER trg_medical_conditions_updated_at
  BEFORE UPDATE ON medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_allergies_updated_at
  BEFORE UPDATE ON allergies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vaccinations_updated_at
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Patients manage their own records
CREATE POLICY "patients_own_conditions" ON medical_conditions
  FOR ALL USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "patients_own_allergies" ON allergies
  FOR ALL USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "patients_own_vaccinations" ON vaccinations
  FOR ALL USING (auth.uid() = patient_id AND NOT is_deleted);

-- Doctors read via appointments
CREATE POLICY "doctors_read_conditions" ON medical_conditions
  FOR SELECT USING (
    NOT is_deleted AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = medical_conditions.patient_id
    )
  );

CREATE POLICY "doctors_read_allergies" ON allergies
  FOR SELECT USING (
    NOT is_deleted AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = allergies.patient_id
    )
  );

CREATE POLICY "doctors_read_vaccinations" ON vaccinations
  FOR SELECT USING (
    NOT is_deleted AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = vaccinations.patient_id
    )
  );

-- Insurance: plans and patient coverage

CREATE TABLE insurance_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider_company text NOT NULL,
  coverage_type text,
  annual_limit numeric(12, 2),
  co_pay_percentage numeric(5, 2),
  network_type text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE patient_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  insurance_plan_id uuid NOT NULL REFERENCES insurance_plans(id),
  policy_number text,
  member_id text,
  card_photo_url text,
  valid_from date,
  valid_until date,
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_insurance_plans_active ON insurance_plans(is_active);
CREATE INDEX idx_patient_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX idx_patient_insurance_plan ON patient_insurance(insurance_plan_id);

-- Triggers
CREATE TRIGGER trg_insurance_plans_updated_at
  BEFORE UPDATE ON insurance_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patient_insurance_updated_at
  BEFORE UPDATE ON patient_insurance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;

-- Anyone can read active insurance plans (public browsing)
CREATE POLICY "public_read_active_plans" ON insurance_plans
  FOR SELECT USING (is_active = true);

-- Admins manage plans
CREATE POLICY "admins_manage_plans" ON insurance_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Patients manage their own insurance
CREATE POLICY "patients_own_insurance" ON patient_insurance
  FOR ALL USING (auth.uid() = patient_id);

-- Doctors read patient insurance via appointments
CREATE POLICY "doctors_read_patient_insurance" ON patient_insurance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = patient_insurance.patient_id
    )
  );

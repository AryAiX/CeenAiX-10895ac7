-- Comprehensive Patient Profile and Dashboard Schema
-- Creates tables for patient profiles, insurance, family members, visits, prescriptions,
-- pharmacies, medication reminders, lab tests, and healthcare messages

-- Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_image_url text,
  emirates_id_front_url text,
  emirates_id_back_url text,
  emirates_id_number text,
  date_of_birth date,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insurance Information Table
CREATE TABLE IF NOT EXISTS insurance_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  policy_number text,
  member_id text,
  group_number text,
  coverage_type text,
  valid_from date,
  valid_until date,
  card_image_url text,
  created_at timestamptz DEFAULT now()
);

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  date_of_birth date,
  emirates_id text,
  profile_image_url text,
  created_at timestamptz DEFAULT now()
);

-- Doctor Visits Table
CREATE TABLE IF NOT EXISTS doctor_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  specialty text,
  visit_date timestamptz NOT NULL,
  visit_type text,
  diagnosis text,
  notes text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text,
  refills_remaining integer DEFAULT 0,
  prescribed_date timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  working_hours text,
  is_24_hours boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Patient Pharmacies Junction Table
CREATE TABLE IF NOT EXISTS patient_pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE CASCADE,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, pharmacy_id)
);

-- Medication Reminders Table
CREATE TABLE IF NOT EXISTS medication_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  reminder_time time NOT NULL,
  days_of_week text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Lab Tests Table
CREATE TABLE IF NOT EXISTS lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  test_date timestamptz NOT NULL,
  lab_name text,
  result text,
  result_file_url text,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Healthcare Messages Table
CREATE TABLE IF NOT EXISTS healthcare_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_type text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_patient_id ON insurance_information(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_members_patient_id ON family_members(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_visits_patient_id ON doctor_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_pharmacies_patient_id ON patient_pharmacies(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_patient_id ON medication_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient_id ON lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_messages_patient_id ON healthcare_messages(patient_id);

-- Enable Row Level Security
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
CREATE POLICY "Users can view own patient profile"
  ON patient_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patient profile"
  ON patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient profile"
  ON patient_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for insurance_information
CREATE POLICY "Users can view own insurance"
  ON insurance_information FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own insurance"
  ON insurance_information FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own insurance"
  ON insurance_information FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own insurance"
  ON insurance_information FOR DELETE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for family_members
CREATE POLICY "Users can view own family members"
  ON family_members FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own family members"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own family members"
  ON family_members FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own family members"
  ON family_members FOR DELETE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for doctor_visits
CREATE POLICY "Users can view own doctor visits"
  ON doctor_visits FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own doctor visits"
  ON doctor_visits FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for prescriptions
CREATE POLICY "Users can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for pharmacies (public read)
CREATE POLICY "Anyone can view pharmacies"
  ON pharmacies FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for patient_pharmacies
CREATE POLICY "Users can view own pharmacy preferences"
  ON patient_pharmacies FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pharmacy preferences"
  ON patient_pharmacies FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own pharmacy preferences"
  ON patient_pharmacies FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own pharmacy preferences"
  ON patient_pharmacies FOR DELETE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for medication_reminders
CREATE POLICY "Users can view own medication reminders"
  ON medication_reminders FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own medication reminders"
  ON medication_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own medication reminders"
  ON medication_reminders FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own medication reminders"
  ON medication_reminders FOR DELETE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for lab_tests
CREATE POLICY "Users can view own lab tests"
  ON lab_tests FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own lab tests"
  ON lab_tests FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for healthcare_messages
CREATE POLICY "Users can view own healthcare messages"
  ON healthcare_messages FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own healthcare messages"
  ON healthcare_messages FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );
-- Identity & Profiles tables

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  full_name text NOT NULL,
  first_name text,
  last_name text,
  date_of_birth date,
  gender text,
  emirates_id text,  -- encrypted at application level
  phone text,
  email text,
  address text,
  city text,
  avatar_url text,
  notification_preferences jsonb DEFAULT '{}',
  profile_completed boolean NOT NULL DEFAULT false,
  terms_accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id)
);

CREATE TABLE patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_profiles_user_id_unique UNIQUE (user_id)
);

CREATE TABLE doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text,
  specialization text,
  sub_specialization text,
  years_of_experience integer,
  consultation_fee numeric(10, 2),
  bio text,
  languages_spoken jsonb DEFAULT '["English"]',
  dha_license_verified boolean NOT NULL DEFAULT false,
  dha_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT doctor_profiles_user_id_unique UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patient_profiles_updated_at
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Doctors can read profiles of patients they have appointments with
CREATE POLICY "doctors_read_patient_profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = user_profiles.user_id
    )
  );

-- Super admins can read all profiles
CREATE POLICY "admins_read_all_profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'super_admin'
    )
  );

-- Super admins can update all profiles
CREATE POLICY "admins_update_all_profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'super_admin'
    )
  );

-- Patients see their own patient profile
CREATE POLICY "patients_own_patient_profile" ON patient_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Doctors can read patient profiles via appointments
CREATE POLICY "doctors_read_patient_profiles_ext" ON patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = patient_profiles.user_id
    )
  );

-- Doctors see their own doctor profile
CREATE POLICY "doctors_own_doctor_profile" ON doctor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Anyone authenticated can read doctor profiles (for find-doctor)
CREATE POLICY "authenticated_read_doctor_profiles" ON doctor_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anon users can also read doctor profiles (guest browsing)
CREATE POLICY "anon_read_doctor_profiles" ON doctor_profiles
  FOR SELECT USING (auth.role() = 'anon');

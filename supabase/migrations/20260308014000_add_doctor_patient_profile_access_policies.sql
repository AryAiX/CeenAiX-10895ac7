-- Add profile access policies that depend on appointments existing.

DROP POLICY IF EXISTS "doctors_read_patient_profiles" ON user_profiles;
CREATE POLICY "doctors_read_patient_profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = user_profiles.user_id
    )
  );

DROP POLICY IF EXISTS "doctors_read_patient_profiles_ext" ON patient_profiles;
CREATE POLICY "doctors_read_patient_profiles_ext" ON patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = patient_profiles.user_id
    )
  );

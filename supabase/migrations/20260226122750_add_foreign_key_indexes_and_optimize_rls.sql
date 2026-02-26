/*
  # Add Foreign Key Indexes and Optimize RLS Policies

  1. Performance Improvements
    - Add indexes for all foreign key columns to improve query performance
    - Optimize RLS policies to cache auth.uid() calls using SELECT subqueries
    - Fix multiple permissive policies by consolidating them appropriately

  2. Changes
    - Create indexes on 31 foreign key columns across multiple tables
    - Update all RLS policies to use (SELECT auth.uid()) instead of auth.uid()
    - Consolidate overlapping SELECT policies to eliminate multiple permissive policy warnings

  3. Security Notes
    - All indexes improve performance without changing security
    - RLS policy optimization maintains same security level with better performance
*/

-- Add indexes for all unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_types_doctor_id ON appointment_types(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_session_id ON consultation_notes(consultation_session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_doctor_id ON consultation_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_patient_id ON consultation_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_doctor_id ON consultation_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_patient_id ON consultation_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_fee_schedules_doctor_id ON fee_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_imaging_records_user_id ON imaging_records(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON insurance_claims(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user_id ON insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_family_members_family_id ON linked_family_members(family_member_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patient_id ON pharmacy_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy_id ON pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_prescription_id ON pharmacy_orders(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_recipient_id ON secure_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_sender_id ON secure_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_user_id ON vaccination_records(user_id);

-- Optimize RLS policies to use (SELECT auth.uid()) for better performance
-- user_profiles table
DROP POLICY IF EXISTS "Users can view relevant profiles" ON user_profiles;

CREATE POLICY "Users can view relevant profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (SELECT auth.uid())
      AND up.role = 'admin'
    )
  );

-- health_records table
DROP POLICY IF EXISTS "Users can view relevant health records" ON health_records;

CREATE POLICY "Users can view relevant health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = (SELECT auth.uid())
      AND appointments.patient_id = health_records.user_id
    )
  );

-- lab_results table
DROP POLICY IF EXISTS "Users can view relevant lab results" ON lab_results;

CREATE POLICY "Users can view relevant lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = (SELECT auth.uid())
      AND appointments.patient_id = lab_results.user_id
    )
  );

-- imaging_records table
DROP POLICY IF EXISTS "Users can view relevant imaging records" ON imaging_records;

CREATE POLICY "Users can view relevant imaging records"
  ON imaging_records FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = (SELECT auth.uid())
      AND appointments.patient_id = imaging_records.user_id
    )
  );

-- health_scores table
DROP POLICY IF EXISTS "Authenticated users can create own health scores" ON health_scores;

CREATE POLICY "Authenticated users can create own health scores"
  ON health_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- appointments table
DROP POLICY IF EXISTS "Users can view relevant appointments" ON appointments;

CREATE POLICY "Users can view relevant appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid()) OR
    doctor_id = (SELECT auth.uid())
  );

-- consultation_sessions table
DROP POLICY IF EXISTS "Users can view relevant consultation sessions" ON consultation_sessions;

CREATE POLICY "Users can view relevant consultation sessions"
  ON consultation_sessions FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid()) OR
    doctor_id = (SELECT auth.uid())
  );

-- consultation_notes table
DROP POLICY IF EXISTS "Users can view relevant consultation notes" ON consultation_notes;

CREATE POLICY "Users can view relevant consultation notes"
  ON consultation_notes FOR SELECT
  TO authenticated
  USING (
    doctor_id = (SELECT auth.uid()) OR
    patient_id = (SELECT auth.uid())
  );

-- prescriptions table
DROP POLICY IF EXISTS "Users can view relevant prescriptions" ON prescriptions;

CREATE POLICY "Users can view relevant prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid()) OR
    doctor_id = (SELECT auth.uid())
  );

-- pharmacy_orders table
DROP POLICY IF EXISTS "Users can view relevant pharmacy orders" ON pharmacy_orders;

CREATE POLICY "Users can view relevant pharmacy orders"
  ON pharmacy_orders FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid()) OR
    (pharmacy_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'pharmacy'
    ))
  );

-- doctor_availability table
DROP POLICY IF EXISTS "Authenticated users can view doctor availability" ON doctor_availability;
DROP POLICY IF EXISTS "Doctors can manage own availability" ON doctor_availability;

CREATE POLICY "Users can view and manage doctor availability"
  ON doctor_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert own availability"
  ON doctor_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND doctor_availability.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can update own availability"
  ON doctor_availability FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND doctor_availability.doctor_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND doctor_availability.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own availability"
  ON doctor_availability FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND doctor_availability.doctor_id = (SELECT auth.uid())
    )
  );

-- appointment_types table
DROP POLICY IF EXISTS "Authenticated users can view appointment types" ON appointment_types;
DROP POLICY IF EXISTS "Doctors can manage own appointment types" ON appointment_types;

CREATE POLICY "Users can view appointment types"
  ON appointment_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert own appointment types"
  ON appointment_types FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND appointment_types.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can update own appointment types"
  ON appointment_types FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND appointment_types.doctor_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND appointment_types.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own appointment types"
  ON appointment_types FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND appointment_types.doctor_id = (SELECT auth.uid())
    )
  );

-- fee_schedules table
DROP POLICY IF EXISTS "Authenticated users can view fee schedules" ON fee_schedules;
DROP POLICY IF EXISTS "Doctors can manage own fee schedules" ON fee_schedules;

CREATE POLICY "Users can view fee schedules"
  ON fee_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert own fee schedules"
  ON fee_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND fee_schedules.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can update own fee schedules"
  ON fee_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND fee_schedules.doctor_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND fee_schedules.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own fee schedules"
  ON fee_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = (SELECT auth.uid())
      AND user_profiles.role = 'doctor'
      AND fee_schedules.doctor_id = (SELECT auth.uid())
    )
  );

-- audit_logs table
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;

CREATE POLICY "Authenticated users can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
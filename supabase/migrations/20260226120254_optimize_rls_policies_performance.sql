/*
  # Optimize RLS Policies for Performance

  ## Performance Improvements
  
  This migration optimizes all RLS policies by wrapping auth function calls in SELECT statements.
  This prevents re-evaluation of auth.uid() for each row, significantly improving query performance at scale.

  ## Changes
  
  1. Drop existing policies
  2. Recreate them with optimized (select auth.uid()) syntax
  
  ## Tables Updated
  
  - user_profiles
  - doctor_profiles
  - health_records
  - appointments
  - prescriptions
  - secure_messages
  - notifications
  - lab_results
  - imaging_records
  - linked_family_members
*/

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admin can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid())
      AND up.role = 'admin'
    )
  );

-- doctor_profiles policies
DROP POLICY IF EXISTS "Doctors can view own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Patients can view doctor profiles" ON doctor_profiles;

CREATE POLICY "Doctors can view own profile"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Doctors can update own profile"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Patients can view doctor profiles"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING (true);

-- health_records policies
DROP POLICY IF EXISTS "Users can view own health records" ON health_records;
DROP POLICY IF EXISTS "Users can update own health records" ON health_records;
DROP POLICY IF EXISTS "Doctors can view patient health records" ON health_records;

CREATE POLICY "Users can view own health records"
  ON health_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own health records"
  ON health_records FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Doctors can view patient health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles dp
      WHERE dp.user_id = (select auth.uid())
    )
  );

-- appointments policies
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;

CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Doctors can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = patient_id);

CREATE POLICY "Doctors can update appointment status"
  ON appointments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

-- prescriptions policies
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON prescriptions;

CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Doctors can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = doctor_id);

-- secure_messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON secure_messages;
DROP POLICY IF EXISTS "Users can send messages" ON secure_messages;

CREATE POLICY "Users can view own messages"
  ON secure_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = sender_id OR (select auth.uid()) = recipient_id);

CREATE POLICY "Users can send messages"
  ON secure_messages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = sender_id);

-- notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- lab_results policies
DROP POLICY IF EXISTS "Patients can view own lab results" ON lab_results;
DROP POLICY IF EXISTS "Doctors can view patient lab results" ON lab_results;

CREATE POLICY "Patients can view own lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Doctors can view patient lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles dp
      WHERE dp.user_id = (select auth.uid())
    )
  );

-- imaging_records policies
DROP POLICY IF EXISTS "Patients can view own imaging" ON imaging_records;
DROP POLICY IF EXISTS "Doctors can view patient imaging" ON imaging_records;

CREATE POLICY "Patients can view own imaging"
  ON imaging_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Doctors can view patient imaging"
  ON imaging_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles dp
      WHERE dp.user_id = (select auth.uid())
    )
  );

-- linked_family_members policies
DROP POLICY IF EXISTS "Users can view own family links" ON linked_family_members;
DROP POLICY IF EXISTS "Users can create family links" ON linked_family_members;

CREATE POLICY "Users can view own family links"
  ON linked_family_members FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Users can create family links"
  ON linked_family_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = patient_id);

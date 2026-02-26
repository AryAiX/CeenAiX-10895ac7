/*
  # Fix User Profile and Doctor Profile Creation Policies

  ## Issue
  
  When users sign up, they cannot create their own user_profiles and doctor_profiles records
  because the INSERT policies were missing.

  ## Changes
  
  1. Add INSERT policies for user_profiles to allow users to create their own profile during signup
  2. Add INSERT policy for doctor_profiles to allow doctors to create their profile during signup
  3. Ensure health_records can be created for users during signup

  ## Security
  
  All policies maintain security by ensuring users can only create profiles for themselves
  using auth.uid() checks.
*/

-- user_profiles: Add INSERT policy
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- doctor_profiles: Add INSERT policy
CREATE POLICY "Doctors can create own profile"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- health_records: Add INSERT policy
CREATE POLICY "Users can create own health record"
  ON health_records FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

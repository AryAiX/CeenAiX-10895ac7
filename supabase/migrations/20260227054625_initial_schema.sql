/*
  # Initial Healthcare Platform Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - patient, doctor, nurse, pharmacy, laboratory, admin
      - `full_name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `date_of_birth` (date, optional)
      - `gender` (text, optional)
      - `profile_photo_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `doctor_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `license_number` (text)
      - `specialization` (text)
      - `years_of_experience` (integer, optional)
      - `consultation_fee` (decimal, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for user profile creation during signup
    - Add policies for doctors to manage their profiles
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'pharmacy', 'laboratory', 'admin')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  profile_photo_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create doctor_profiles table
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  license_number text NOT NULL,
  specialization text NOT NULL,
  years_of_experience integer CHECK (years_of_experience >= 0),
  consultation_fee decimal(10,2) CHECK (consultation_fee >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialization ON doctor_profiles(specialization);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Doctor Profiles Policies
CREATE POLICY "Anyone can view doctor profiles"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert own profile"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

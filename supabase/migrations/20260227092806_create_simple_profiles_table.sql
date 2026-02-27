/*
  # Simple Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Unique identifier for each profile
      - `full_name` (text) - User's full name
      - `email` (text, unique) - User's email address
      - `phone` (text) - User's phone number
      - `date_of_birth` (date) - User's date of birth
      - `gender` (text) - User's gender
      - `address` (text) - User's address
      - `role` (text) - User role (patient or doctor)
      - `specialization` (text) - Doctor's specialization (for doctors only)
      - `license_number` (text) - Doctor's license number (for doctors only)
      - `created_at` (timestamptz) - When the profile was created
      - `updated_at` (timestamptz) - When the profile was last updated
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policies for public access (since auth is removed)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  role text NOT NULL DEFAULT 'patient',
  specialization text,
  license_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert profiles"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
  ON profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete profiles"
  ON profiles
  FOR DELETE
  TO public
  USING (true);
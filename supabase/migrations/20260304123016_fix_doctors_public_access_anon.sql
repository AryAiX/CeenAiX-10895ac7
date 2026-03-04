/*
  # Fix Doctors Public Access for Anonymous Users

  1. Changes
    - Update doctors table RLS policy to allow anonymous (unauthenticated) users to view doctors
    - This allows the public Find Doctor page to work for all users

  2. Security
    - Maintains read-only access for doctors table
    - No changes to write permissions
*/

DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;

CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  USING (true);

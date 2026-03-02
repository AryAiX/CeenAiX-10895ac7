/*
  # Fix Doctors Public Access

  1. Changes
    - Drop existing restrictive policy that only allows authenticated users
    - Add new policy allowing public (anonymous) access to view doctors
    - This enables the Find Doctor page to display doctors without requiring login

  2. Security
    - Read-only access for public users
    - No write permissions for anonymous users
*/

DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;

CREATE POLICY "Public can view doctors"
  ON doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);

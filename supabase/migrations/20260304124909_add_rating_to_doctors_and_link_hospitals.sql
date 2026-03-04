/*
  # Add Rating to Doctors and Link with Hospitals

  1. Changes
    - Add `average_rating` column to doctors table
    - Add `total_ratings` column to doctors table
    - Create function to update doctor ratings automatically
    - Create sample hospital-doctor relationships

  2. Data
    - Link existing doctors to hospitals/clinics
    - Assign random ratings to doctors

  3. Notes
    - The average_rating will be auto-calculated from doctor_ratings table
    - Function updates whenever a new rating is added
*/

-- Add rating columns to doctors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctors' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE doctors ADD COLUMN average_rating decimal(2,1) DEFAULT 0.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctors' AND column_name = 'total_ratings'
  ) THEN
    ALTER TABLE doctors ADD COLUMN total_ratings integer DEFAULT 0;
  END IF;
END $$;

-- Create function to update doctor ratings
CREATE OR REPLACE FUNCTION update_doctor_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctors
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM doctor_ratings
      WHERE doctor_id = NEW.doctor_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM doctor_ratings
      WHERE doctor_id = NEW.doctor_id
    )
  WHERE id = NEW.doctor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update ratings
DROP TRIGGER IF EXISTS trigger_update_doctor_ratings ON doctor_ratings;
CREATE TRIGGER trigger_update_doctor_ratings
AFTER INSERT OR UPDATE ON doctor_ratings
FOR EACH ROW
EXECUTE FUNCTION update_doctor_ratings();

-- Assign random ratings to existing doctors
UPDATE doctors
SET 
  average_rating = 3.5 + (random() * 1.5),
  total_ratings = floor(random() * 100 + 10)::integer
WHERE average_rating = 0;

-- Link doctors to hospitals
INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
SELECT 
  h.id,
  d.id,
  true,
  '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  '9:00 AM - 5:00 PM',
  'Room ' || (100 + floor(random() * 400))::text
FROM hospitals h
CROSS JOIN doctors d
WHERE random() < 0.3
ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

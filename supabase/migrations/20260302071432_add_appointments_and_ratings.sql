-- Compatibility layer for the current Bolt-era public doctor experience.
-- Keep this independent from the canonical appointments schema created earlier.

CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  image_url text,
  available_slots integer DEFAULT 0,
  accepts_video boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctor_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_ratings_user_id ON doctor_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_doctor_id ON doctor_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_appointment_id ON doctor_ratings(appointment_id);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own ratings"
  ON doctor_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ratings for own completed appointments"
  ON doctor_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_id
        AND appointments.patient_id = auth.uid()
        AND appointments.status = 'completed'
        AND NOT appointments.is_deleted
    )
  );

INSERT INTO doctors (id, name, specialty, location, latitude, longitude, image_url, available_slots, accepts_video)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Dr. Sarah Ahmed', 'General Medicine', 'Dubai Healthcare City', 25.1172, 55.2082, 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200', 12, true),
  ('d2222222-2222-2222-2222-222222222222', 'Dr. Mohammed Hassan', 'Cardiology', 'Al Zahra Hospital', 25.2048, 55.2708, 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200', 8, true),
  ('d3333333-3333-3333-3333-333333333333', 'Dr. Fatima Al-Rashid', 'Dermatology', 'Mediclinic City Hospital', 25.1280, 55.2090, 'https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=200', 15, false),
  ('d4444444-4444-4444-4444-444444444444', 'Dr. Ahmed Khalil', 'Orthopedics', 'NMC Royal Hospital', 25.2244, 55.2819, 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200', 6, true)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE VIEW doctor_ratings_summary AS
SELECT
  doctor_id,
  COUNT(*) AS total_reviews,
  ROUND(AVG(rating)::numeric, 1) AS average_rating
FROM doctor_ratings
GROUP BY doctor_id;

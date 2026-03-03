/*
  # Create Hospitals and Clinics Schema

  1. New Tables
    - `hospitals`
      - `id` (uuid, primary key)
      - `name` (text) - Hospital/clinic name
      - `type` (text) - 'hospital' or 'clinic'
      - `address` (text) - Full address
      - `city` (text) - City location
      - `phone` (text) - Contact number
      - `email` (text) - Email address
      - `image_url` (text) - Photo URL
      - `rating` (decimal) - Average rating
      - `total_reviews` (integer) - Number of reviews
      - `description` (text) - Description
      - `facilities` (jsonb) - Array of facilities
      - `specialties` (jsonb) - Array of specialties
      - `emergency_services` (boolean) - Has emergency services
      - `parking_available` (boolean) - Parking availability
      - `insurance_accepted` (jsonb) - List of accepted insurance
      - `operating_hours` (jsonb) - Opening hours
      - `latitude` (decimal) - GPS latitude
      - `longitude` (decimal) - GPS longitude
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hospital_doctors`
      - `id` (uuid, primary key)
      - `hospital_id` (uuid, foreign key) - Reference to hospitals
      - `doctor_id` (uuid, foreign key) - Reference to doctors
      - `is_available` (boolean) - Current availability
      - `consultation_days` (jsonb) - Days available
      - `consultation_hours` (text) - Time slots
      - `room_number` (text) - Office/room number
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Restrict write access to authenticated users

  3. Indexes
    - Index on hospital type, city, and specialties for filtering
    - Index on doctor availability
*/

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hospital', 'clinic')),
  address text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  email text,
  image_url text,
  rating decimal(2,1) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  description text,
  facilities jsonb DEFAULT '[]'::jsonb,
  specialties jsonb DEFAULT '[]'::jsonb,
  emergency_services boolean DEFAULT false,
  parking_available boolean DEFAULT false,
  insurance_accepted jsonb DEFAULT '[]'::jsonb,
  operating_hours jsonb DEFAULT '{}'::jsonb,
  latitude decimal(10,8),
  longitude decimal(11,8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hospital_doctors junction table
CREATE TABLE IF NOT EXISTS hospital_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  is_available boolean DEFAULT true,
  consultation_days jsonb DEFAULT '[]'::jsonb,
  consultation_hours text,
  room_number text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hospital_id, doctor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_rating ON hospitals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_hospital_id ON hospital_doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_doctor_id ON hospital_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_available ON hospital_doctors(is_available);

-- Enable RLS
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_doctors ENABLE ROW LEVEL SECURITY;

-- Policies for hospitals (public read access)
CREATE POLICY "Anyone can view hospitals"
  ON hospitals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert hospitals"
  ON hospitals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hospitals"
  ON hospitals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for hospital_doctors (public read access)
CREATE POLICY "Anyone can view hospital doctors"
  ON hospital_doctors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert hospital doctors"
  ON hospital_doctors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hospital doctors"
  ON hospital_doctors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
-- Scheduling: doctor availability and blocked slots

CREATE TABLE doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  facility_id uuid,  -- FK to facilities added in Phase 3
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration_minutes integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  blocked_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_blocked_time_range CHECK (start_time < end_time)
);

-- Indexes
CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_active ON doctor_availability(doctor_id, is_active) WHERE is_active;
CREATE INDEX idx_blocked_slots_doctor_date ON blocked_slots(doctor_id, blocked_date);

-- Triggers
CREATE TRIGGER trg_doctor_availability_updated_at
  BEFORE UPDATE ON doctor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_blocked_slots_updated_at
  BEFORE UPDATE ON blocked_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Doctors manage their own availability
CREATE POLICY "doctors_own_availability" ON doctor_availability
  FOR ALL USING (auth.uid() = doctor_id);

-- Anyone authenticated can read active availability (for booking)
CREATE POLICY "authenticated_read_availability" ON doctor_availability
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Anon users can also read availability (guest browsing)
CREATE POLICY "anon_read_availability" ON doctor_availability
  FOR SELECT USING (is_active = true AND auth.role() = 'anon');

-- Doctors manage their own blocked slots
CREATE POLICY "doctors_own_blocked_slots" ON blocked_slots
  FOR ALL USING (auth.uid() = doctor_id);

-- Anyone authenticated can read blocked slots (for booking)
CREATE POLICY "authenticated_read_blocked_slots" ON blocked_slots
  FOR SELECT USING (auth.role() = 'authenticated');

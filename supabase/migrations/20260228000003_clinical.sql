-- Clinical tables: appointments, consultation notes, prescriptions, lab orders

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  facility_id uuid,  -- FK to facilities added in Phase 3
  type appointment_type NOT NULL DEFAULT 'in_person',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  chief_complaint text,
  notes text,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  subjective text,
  objective text,
  assessment text,
  plan text,
  ai_generated_draft text,
  doctor_approved boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  appointment_id uuid REFERENCES appointments(id),
  status prescription_status NOT NULL DEFAULT 'active',
  prescribed_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  quantity integer,
  instructions text,
  is_dispensed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  appointment_id uuid REFERENCES appointments(id),
  status lab_order_status NOT NULL DEFAULT 'ordered',
  ordered_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lab_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id uuid NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  test_code text,
  status lab_order_status NOT NULL DEFAULT 'ordered',
  result_value text,
  result_unit text,
  reference_range text,
  is_abnormal boolean,
  resulted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_consultation_notes_appointment ON consultation_notes(appointment_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_doctor ON lab_orders(doctor_id);
CREATE INDEX idx_lab_order_items_order ON lab_order_items(lab_order_id);

-- Triggers
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_consultation_notes_updated_at
  BEFORE UPDATE ON consultation_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_prescription_items_updated_at
  BEFORE UPDATE ON prescription_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_orders_updated_at
  BEFORE UPDATE ON lab_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_order_items_updated_at
  BEFORE UPDATE ON lab_order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;

-- Appointments: patients see their own, doctors see their own
CREATE POLICY "patients_own_appointments" ON appointments
  FOR ALL USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "doctors_own_appointments" ON appointments
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted);

CREATE POLICY "admins_all_appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Consultation notes: doctor who wrote them or patient of the appointment
CREATE POLICY "doctors_own_notes" ON consultation_notes
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted);

CREATE POLICY "patients_read_notes" ON consultation_notes
  FOR SELECT USING (
    NOT is_deleted AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = consultation_notes.appointment_id
        AND appointments.patient_id = auth.uid()
    )
  );

-- Prescriptions: patient sees own, doctor sees own
CREATE POLICY "patients_own_prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "doctors_own_prescriptions" ON prescriptions
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted);

-- Prescription items: accessible via prescription ownership
CREATE POLICY "patients_read_prescription_items" ON prescription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = prescription_items.prescription_id
        AND prescriptions.patient_id = auth.uid()
        AND NOT prescriptions.is_deleted
    )
  );

CREATE POLICY "doctors_manage_prescription_items" ON prescription_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = prescription_items.prescription_id
        AND prescriptions.doctor_id = auth.uid()
        AND NOT prescriptions.is_deleted
    )
  );

-- Lab orders: patient sees own, doctor sees own
CREATE POLICY "patients_own_lab_orders" ON lab_orders
  FOR SELECT USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "doctors_own_lab_orders" ON lab_orders
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted);

-- Lab order items: accessible via lab order ownership
CREATE POLICY "patients_read_lab_items" ON lab_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lab_orders
      WHERE lab_orders.id = lab_order_items.lab_order_id
        AND lab_orders.patient_id = auth.uid()
        AND NOT lab_orders.is_deleted
    )
  );

CREATE POLICY "doctors_manage_lab_items" ON lab_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lab_orders
      WHERE lab_orders.id = lab_order_items.lab_order_id
        AND lab_orders.doctor_id = auth.uid()
        AND NOT lab_orders.is_deleted
    )
  );

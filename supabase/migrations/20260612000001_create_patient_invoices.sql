CREATE TABLE patient_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE patient_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_manage_invoices"
ON patient_invoices FOR ALL
USING (
  facility_id IN (
    SELECT facility_id FROM clinic_portal_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "patient_read_own_invoices"
ON patient_invoices FOR SELECT
USING (patient_id = auth.uid());
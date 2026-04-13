-- Patient dashboard support: structured vitals history + insurance usage

ALTER TABLE public.patient_insurance
  ADD COLUMN IF NOT EXISTS annual_limit_used numeric(12, 2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  recorded_by uuid REFERENCES auth.users(id),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  systolic_bp integer,
  diastolic_bp integer,
  heart_rate integer,
  temperature_c numeric(4, 1),
  spo2_percent numeric(5, 2),
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  bmi numeric(5, 2),
  source text NOT NULL DEFAULT 'manual',
  notes text,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_vitals_bp_pair_chk CHECK (
    (systolic_bp IS NULL AND diastolic_bp IS NULL)
    OR (systolic_bp IS NOT NULL AND diastolic_bp IS NOT NULL)
  ),
  CONSTRAINT patient_vitals_has_measurement_chk CHECK (
    systolic_bp IS NOT NULL
    OR heart_rate IS NOT NULL
    OR temperature_c IS NOT NULL
    OR spo2_percent IS NOT NULL
    OR weight_kg IS NOT NULL
    OR height_cm IS NOT NULL
    OR bmi IS NOT NULL
  ),
  CONSTRAINT patient_vitals_source_chk CHECK (source IN ('manual', 'device', 'imported'))
);

CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient
  ON public.patient_vitals(patient_id, recorded_at DESC)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_patient_vitals_appointment
  ON public.patient_vitals(appointment_id)
  WHERE appointment_id IS NOT NULL;

CREATE TRIGGER trg_patient_vitals_updated_at
  BEFORE UPDATE ON public.patient_vitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_read_own_vitals"
  ON public.patient_vitals
  FOR SELECT
  USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "doctors_read_patient_vitals"
  ON public.patient_vitals
  FOR SELECT
  USING (
    NOT is_deleted
    AND EXISTS (
      SELECT 1
      FROM public.appointments
      WHERE appointments.patient_id = patient_vitals.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

CREATE POLICY "doctors_insert_patient_vitals"
  ON public.patient_vitals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.appointments
      WHERE appointments.patient_id = patient_vitals.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

CREATE POLICY "doctors_update_patient_vitals"
  ON public.patient_vitals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.appointments
      WHERE appointments.patient_id = patient_vitals.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.appointments
      WHERE appointments.patient_id = patient_vitals.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

CREATE POLICY "super_admin_read_patient_vitals"
  ON public.patient_vitals
  FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'super_admin');

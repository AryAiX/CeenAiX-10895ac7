-- AI Consultation Recording (Phase 2)
-- Audio capture, transcription, AI-generated clinical notes, consent + audit.
--
-- Central entity remains the appointment: every recording references an
-- appointment, and the generated SOAP note can be promoted into the existing
-- consultation_notes record reviewed by the doctor.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE consultation_recording_status AS ENUM (
  'recording',
  'processing',
  'ready',
  'approved',
  'discarded'
);

CREATE TYPE consultation_consent_method AS ENUM ('verbal', 'signed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE consultation_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  clinic_id uuid,  -- facilities FK added in Phase 3; mirrors appointments.facility_id
  audio_storage_path text,
  audio_mime_type text,
  duration_seconds integer NOT NULL DEFAULT 0,
  language_detected text,
  status consultation_recording_status NOT NULL DEFAULT 'recording',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consultation_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES consultation_recordings(id) ON DELETE CASCADE,
  full_text text,
  -- array of { speaker, start_ms, end_ms, text, confidence }
  segments jsonb NOT NULL DEFAULT '[]'::jsonb,
  language text,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES consultation_recordings(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  chief_complaint text,
  soap_subjective text,
  soap_objective text,
  soap_assessment text,
  soap_plan text,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  medications jsonb NOT NULL DEFAULT '[]'::jsonb,
  diagnoses jsonb NOT NULL DEFAULT '[]'::jsonb,
  follow_up jsonb NOT NULL DEFAULT '[]'::jsonb,
  education_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_language text NOT NULL DEFAULT 'en',
  model_used text,
  prompt_template text NOT NULL DEFAULT 'general',
  custom_instructions text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consultation_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES consultation_recordings(id) ON DELETE SET NULL,
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  consent_method consultation_consent_method NOT NULL DEFAULT 'verbal',
  informed_patient boolean NOT NULL DEFAULT false,
  verbal_consent boolean NOT NULL DEFAULT false,
  signature_image_url text,
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consultation_recordings_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid REFERENCES consultation_recordings(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_consultation_recordings_appointment ON consultation_recordings(appointment_id);
CREATE INDEX idx_consultation_recordings_doctor ON consultation_recordings(doctor_id);
CREATE INDEX idx_consultation_recordings_patient ON consultation_recordings(patient_id);
CREATE INDEX idx_consultation_recordings_status ON consultation_recordings(status);
CREATE INDEX idx_consultation_transcripts_recording ON consultation_transcripts(recording_id);
CREATE INDEX idx_ai_clinical_notes_recording ON ai_clinical_notes(recording_id);
CREATE INDEX idx_ai_clinical_notes_appointment ON ai_clinical_notes(appointment_id);
CREATE INDEX idx_ai_clinical_notes_doctor ON ai_clinical_notes(doctor_id);
CREATE INDEX idx_consultation_consent_log_appointment ON consultation_consent_log(appointment_id);
CREATE INDEX idx_consultation_consent_log_recording ON consultation_consent_log(recording_id);
CREATE INDEX idx_consultation_recordings_audit_recording ON consultation_recordings_audit(recording_id);
CREATE INDEX idx_consultation_recordings_audit_actor ON consultation_recordings_audit(actor_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_consultation_recordings_updated_at
  BEFORE UPDATE ON consultation_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_consultation_transcripts_updated_at
  BEFORE UPDATE ON consultation_transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_clinical_notes_updated_at
  BEFORE UPDATE ON ai_clinical_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE consultation_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_recordings_audit ENABLE ROW LEVEL SECURITY;

-- Recordings: treating doctor manages; patient reads own; admin reads.
CREATE POLICY "doctors_own_recordings" ON consultation_recordings
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "patients_read_recordings" ON consultation_recordings
  FOR SELECT USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "admins_read_recordings" ON consultation_recordings
  FOR SELECT USING (public.is_current_user_super_admin());

-- Transcripts: scoped through the parent recording.
CREATE POLICY "doctors_manage_transcripts" ON consultation_transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM consultation_recordings r
      WHERE r.id = consultation_transcripts.recording_id
        AND r.doctor_id = auth.uid()
        AND NOT r.is_deleted
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consultation_recordings r
      WHERE r.id = consultation_transcripts.recording_id
        AND r.doctor_id = auth.uid()
    )
  );

CREATE POLICY "patients_read_transcripts" ON consultation_transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultation_recordings r
      WHERE r.id = consultation_transcripts.recording_id
        AND r.patient_id = auth.uid()
        AND NOT r.is_deleted
    )
  );

CREATE POLICY "admins_read_transcripts" ON consultation_transcripts
  FOR SELECT USING (public.is_current_user_super_admin());

-- AI clinical notes: treating doctor manages; patient reads own; admin reads.
CREATE POLICY "doctors_own_clinical_notes" ON ai_clinical_notes
  FOR ALL USING (auth.uid() = doctor_id AND NOT is_deleted)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "patients_read_clinical_notes" ON ai_clinical_notes
  FOR SELECT USING (auth.uid() = patient_id AND NOT is_deleted);

CREATE POLICY "admins_read_clinical_notes" ON ai_clinical_notes
  FOR SELECT USING (public.is_current_user_super_admin());

-- Consent log: append-only. Doctor inserts + reads own; patient reads own; admin reads.
CREATE POLICY "doctors_insert_consent" ON consultation_consent_log
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "doctors_read_consent" ON consultation_consent_log
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "patients_read_consent" ON consultation_consent_log
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "admins_read_consent" ON consultation_consent_log
  FOR SELECT USING (public.is_current_user_super_admin());

-- Audit log: append-only. Actor inserts; doctor/admin read.
CREATE POLICY "actors_insert_audit" ON consultation_recordings_audit
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "doctors_read_audit" ON consultation_recordings_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultation_recordings r
      WHERE r.id = consultation_recordings_audit.recording_id
        AND r.doctor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = consultation_recordings_audit.appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

CREATE POLICY "admins_read_audit_recordings" ON consultation_recordings_audit
  FOR SELECT USING (public.is_current_user_super_admin());

-- ---------------------------------------------------------------------------
-- Storage: encrypted, private audio bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultation-audio',
  'consultation-audio',
  false,
  104857600, -- 100 MB
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Objects are stored under {doctor_id}/{appointment_id}/{file}.
CREATE POLICY "consultation_audio_doctor_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'consultation-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'consultation-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "consultation_audio_patient_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'consultation-audio'
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.doctor_id::text = (storage.foldername(name))[1]
        AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "consultation_audio_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'consultation-audio'
    AND public.is_current_user_super_admin()
  );

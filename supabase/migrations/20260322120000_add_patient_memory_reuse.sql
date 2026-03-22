-- Reusable patient memory facts and pre-visit question memory keys.

DO $$
BEGIN
  CREATE TYPE patient_memory_source_kind AS ENUM ('pre_visit_answer', 'ai_chat_message');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE patient_memory_value_type AS ENUM ('text', 'text_list', 'boolean', 'number', 'date', 'json');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE patient_memory_status AS ENUM ('suggested', 'confirmed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE pre_visit_template_questions
  ADD COLUMN IF NOT EXISTS memory_key text;

UPDATE pre_visit_template_questions
SET memory_key = question_key
WHERE memory_key IS NULL
  AND autofill_source IS NULL;

CREATE TABLE IF NOT EXISTS patient_memory_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_kind patient_memory_source_kind NOT NULL,
  source_record_id uuid NOT NULL,
  memory_key text NOT NULL,
  label text NOT NULL,
  value_type patient_memory_value_type NOT NULL DEFAULT 'text',
  value_text text,
  value_json jsonb,
  status patient_memory_status NOT NULL DEFAULT 'suggested',
  confidence numeric(4,3) NOT NULL DEFAULT 0.500,
  usable_in_chat boolean NOT NULL DEFAULT true,
  usable_in_forms boolean NOT NULL DEFAULT true,
  confirmed_at timestamptz,
  last_used_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_memory_facts_source_unique UNIQUE (source_kind, source_record_id, memory_key),
  CONSTRAINT patient_memory_facts_confidence_range CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_pre_visit_questions_memory_key
  ON pre_visit_template_questions(memory_key)
  WHERE memory_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_memory_patient_key
  ON patient_memory_facts(patient_id, memory_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_memory_forms
  ON patient_memory_facts(patient_id, usable_in_forms, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_memory_chat
  ON patient_memory_facts(patient_id, usable_in_chat, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_patient_memory_facts_updated_at ON patient_memory_facts;
CREATE TRIGGER trg_patient_memory_facts_updated_at
  BEFORE UPDATE ON patient_memory_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION create_pre_visit_assessment_for_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_template pre_visit_templates%ROWTYPE;
  snapshot_payload jsonb;
BEGIN
  IF NEW.is_deleted OR NEW.status NOT IN ('scheduled', 'confirmed') THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO selected_template
  FROM pre_visit_templates
  WHERE doctor_user_id = NEW.doctor_id
    AND status = 'published'
    AND is_active = true
    AND is_deleted = false
  ORDER BY published_at DESC NULLS LAST, created_at DESC
  LIMIT 1;

  IF selected_template.id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT jsonb_build_object(
    'templateId', selected_template.id,
    'title', selected_template.title,
    'description', selected_template.description,
    'specializationId', selected_template.specialization_id,
    'questions',
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'key', question.question_key,
            'label', question.label,
            'helpText', question.help_text,
            'type', question.question_type,
            'required', question.is_required,
            'options', question.options,
            'displayOrder', question.display_order,
            'autofillSource', question.autofill_source,
            'memoryKey', question.memory_key,
            'aiInstructions', question.ai_instructions
          )
          ORDER BY question.display_order, question.created_at
        ),
        '[]'::jsonb
      )
  )
  INTO snapshot_payload
  FROM pre_visit_template_questions AS question
  WHERE question.template_id = selected_template.id;

  INSERT INTO appointment_pre_visit_assessments (
    appointment_id,
    patient_id,
    doctor_id,
    template_id,
    template_title,
    template_snapshot,
    due_at
  )
  VALUES (
    NEW.id,
    NEW.patient_id,
    NEW.doctor_id,
    selected_template.id,
    selected_template.title,
    COALESCE(snapshot_payload, '{}'::jsonb),
    NEW.scheduled_at
  )
  ON CONFLICT (appointment_id) DO NOTHING;

  RETURN NEW;
END;
$$;

ALTER TABLE patient_memory_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_manage_own_patient_memory_facts" ON patient_memory_facts
  FOR ALL USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "doctors_read_patient_memory_facts_via_appointments" ON patient_memory_facts
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM appointments
      WHERE appointments.patient_id = patient_memory_facts.patient_id
        AND appointments.doctor_id = auth.uid()
        AND appointments.is_deleted = false
    )
  );

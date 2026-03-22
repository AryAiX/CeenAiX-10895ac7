-- Pre-visit intake templates, appointment-linked assessments, answers, and summaries.

DO $$
BEGIN
  CREATE TYPE pre_visit_template_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE pre_visit_question_type AS ENUM (
    'short_text',
    'long_text',
    'single_select',
    'multi_select',
    'boolean',
    'number',
    'date'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE pre_visit_assessment_status AS ENUM ('not_started', 'in_progress', 'completed', 'reviewed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE pre_visit_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization_id uuid REFERENCES specializations(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status pre_visit_template_status NOT NULL DEFAULT 'draft',
  is_active boolean NOT NULL DEFAULT false,
  source_bucket text,
  source_path text,
  source_file_name text,
  extraction_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pre_visit_template_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES pre_visit_templates(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  label text NOT NULL,
  help_text text,
  question_type pre_visit_question_type NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT false,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  autofill_source text,
  ai_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pre_visit_template_questions_unique UNIQUE (template_id, question_key)
);

CREATE TABLE appointment_pre_visit_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES pre_visit_templates(id) ON DELETE SET NULL,
  template_title text NOT NULL,
  template_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status pre_visit_assessment_status NOT NULL DEFAULT 'not_started',
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  last_answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_pre_visit_assessments_appointment_unique UNIQUE (appointment_id)
);

CREATE TABLE appointment_pre_visit_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES appointment_pre_visit_assessments(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  question_label text NOT NULL,
  question_type pre_visit_question_type NOT NULL,
  answer_text text,
  answer_json jsonb,
  autofill_value jsonb,
  autofill_source text,
  autofilled boolean NOT NULL DEFAULT false,
  confirmed_by_patient boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_pre_visit_answers_unique UNIQUE (assessment_id, question_key)
);

CREATE TABLE appointment_pre_visit_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES appointment_pre_visit_assessments(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_text text NOT NULL,
  key_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  pending_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by text NOT NULL DEFAULT 'ai',
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_pre_visit_summaries_assessment_unique UNIQUE (assessment_id)
);

CREATE INDEX idx_pre_visit_templates_doctor ON pre_visit_templates(doctor_user_id);
CREATE INDEX idx_pre_visit_templates_status ON pre_visit_templates(status);
CREATE INDEX idx_pre_visit_templates_specialization ON pre_visit_templates(specialization_id);
CREATE INDEX idx_pre_visit_questions_template ON pre_visit_template_questions(template_id);
CREATE INDEX idx_assessments_patient_status ON appointment_pre_visit_assessments(patient_id, status);
CREATE INDEX idx_assessments_doctor_status ON appointment_pre_visit_assessments(doctor_id, status);
CREATE INDEX idx_assessments_due_at ON appointment_pre_visit_assessments(due_at);
CREATE INDEX idx_answers_assessment ON appointment_pre_visit_answers(assessment_id);
CREATE INDEX idx_summaries_appointment ON appointment_pre_visit_summaries(appointment_id);

CREATE UNIQUE INDEX idx_pre_visit_templates_single_active
  ON pre_visit_templates(doctor_user_id)
  WHERE is_active = true AND status = 'published' AND is_deleted = false;

CREATE TRIGGER trg_pre_visit_templates_updated_at
  BEFORE UPDATE ON pre_visit_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pre_visit_template_questions_updated_at
  BEFORE UPDATE ON pre_visit_template_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointment_pre_visit_assessments_updated_at
  BEFORE UPDATE ON appointment_pre_visit_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointment_pre_visit_answers_updated_at
  BEFORE UPDATE ON appointment_pre_visit_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointment_pre_visit_summaries_updated_at
  BEFORE UPDATE ON appointment_pre_visit_summaries
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

DROP TRIGGER IF EXISTS trg_create_pre_visit_assessment_on_appointment ON appointments;
CREATE TRIGGER trg_create_pre_visit_assessment_on_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_pre_visit_assessment_for_appointment();

ALTER TABLE pre_visit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_visit_template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_pre_visit_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_pre_visit_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_pre_visit_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_manage_own_pre_visit_templates" ON pre_visit_templates
  FOR ALL USING (auth.uid() = doctor_user_id AND is_deleted = false)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "doctors_manage_own_pre_visit_questions" ON pre_visit_template_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM pre_visit_templates
      WHERE pre_visit_templates.id = pre_visit_template_questions.template_id
        AND pre_visit_templates.doctor_user_id = auth.uid()
        AND pre_visit_templates.is_deleted = false
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM pre_visit_templates
      WHERE pre_visit_templates.id = pre_visit_template_questions.template_id
        AND pre_visit_templates.doctor_user_id = auth.uid()
        AND pre_visit_templates.is_deleted = false
    )
  );

CREATE POLICY "patients_read_own_pre_visit_assessments" ON appointment_pre_visit_assessments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "patients_update_own_pre_visit_assessments" ON appointment_pre_visit_assessments
  FOR UPDATE USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "doctors_read_own_pre_visit_assessments" ON appointment_pre_visit_assessments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "doctors_update_own_pre_visit_assessments" ON appointment_pre_visit_assessments
  FOR UPDATE USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "patients_manage_own_pre_visit_answers" ON appointment_pre_visit_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM appointment_pre_visit_assessments
      WHERE appointment_pre_visit_assessments.id = appointment_pre_visit_answers.assessment_id
        AND appointment_pre_visit_assessments.patient_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM appointment_pre_visit_assessments
      WHERE appointment_pre_visit_assessments.id = appointment_pre_visit_answers.assessment_id
        AND appointment_pre_visit_assessments.patient_id = auth.uid()
    )
  );

CREATE POLICY "doctors_read_own_pre_visit_answers" ON appointment_pre_visit_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM appointment_pre_visit_assessments
      WHERE appointment_pre_visit_assessments.id = appointment_pre_visit_answers.assessment_id
        AND appointment_pre_visit_assessments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "patients_manage_own_pre_visit_summaries" ON appointment_pre_visit_summaries
  FOR ALL USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "doctors_read_own_pre_visit_summaries" ON appointment_pre_visit_summaries
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "doctors_update_own_pre_visit_summaries" ON appointment_pre_visit_summaries
  FOR UPDATE USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

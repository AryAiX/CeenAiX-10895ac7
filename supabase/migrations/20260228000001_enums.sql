-- Shared enums used across multiple tables

CREATE TYPE user_role AS ENUM (
  'patient',
  'doctor',
  'nurse',
  'pharmacy',
  'lab',
  'facility_admin',
  'super_admin'
);

CREATE TYPE appointment_type AS ENUM ('in_person', 'virtual');

CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TYPE lab_order_status AS ENUM (
  'ordered',
  'collected',
  'processing',
  'resulted',
  'reviewed'
);

CREATE TYPE condition_status AS ENUM ('active', 'resolved', 'chronic');

CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');

CREATE TYPE notification_type AS ENUM (
  'appointment',
  'medication',
  'lab_result',
  'system',
  'alert'
);

CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'access');

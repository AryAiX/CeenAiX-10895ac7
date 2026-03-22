import type {
  UserRole,
  AppointmentType,
  AppointmentStatus,
  PrescriptionStatus,
  LabOrderStatus,
  ConditionStatus,
  AllergySeverity,
  NotificationType,
  AiMessageRole,
  AuditAction,
  PreVisitTemplateStatus,
  PreVisitQuestionType,
  PreVisitAssessmentStatus,
  PatientMemorySourceKind,
  PatientMemoryValueType,
  PatientMemoryStatus,
  PatientCanonicalUpdateSourceKind,
  PatientCanonicalUpdateStatus,
  PatientCanonicalUpdateStrategy,
  PatientReportedMedicationReviewStatus,
} from './enums';

/** Base fields present on most tables */
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

/** Soft-deletable clinical records */
interface SoftDeletable {
  is_deleted: boolean;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Identity & Profiles
// ---------------------------------------------------------------------------

export interface UserProfile extends BaseRecord {
  user_id: string;
  role: UserRole;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  emirates_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  avatar_url: string | null;
  notification_preferences: Record<string, unknown>;
  profile_completed: boolean;
  terms_accepted: boolean;
}

export interface PatientProfile extends BaseRecord {
  user_id: string;
  blood_type: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

export interface DoctorProfile extends BaseRecord {
  user_id: string;
  license_number: string | null;
  specialization: string | null;
  sub_specialization: string | null;
  years_of_experience: number | null;
  consultation_fee: number | null;
  bio: string | null;
  languages_spoken: string[];
  dha_license_verified: boolean;
  dha_verified_at: string | null;
}

export interface Specialization extends BaseRecord {
  slug: string;
  name: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

export interface DoctorSpecialization extends BaseRecord {
  doctor_user_id: string;
  specialization_id: string;
}

// ---------------------------------------------------------------------------
// Clinical
// ---------------------------------------------------------------------------

export interface Appointment extends BaseRecord, SoftDeletable {
  patient_id: string;
  doctor_id: string;
  facility_id: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduled_at: string;
  duration_minutes: number;
  chief_complaint: string | null;
  notes: string | null;
}

export interface ConsultationNote extends BaseRecord, SoftDeletable {
  appointment_id: string;
  doctor_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  ai_generated_draft: string | null;
  doctor_approved: boolean;
}

export interface Prescription extends BaseRecord, SoftDeletable {
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  status: PrescriptionStatus;
  prescribed_at: string;
}

export interface PrescriptionItem extends BaseRecord {
  prescription_id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  instructions: string | null;
  is_dispensed: boolean;
}

export interface LabOrder extends BaseRecord, SoftDeletable {
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  status: LabOrderStatus;
  ordered_at: string;
}

export interface LabOrderItem extends BaseRecord {
  lab_order_id: string;
  test_name: string;
  test_code: string | null;
  status: LabOrderStatus;
  result_value: string | null;
  result_unit: string | null;
  reference_range: string | null;
  is_abnormal: boolean | null;
  resulted_at: string | null;
}

// ---------------------------------------------------------------------------
// Medical Records
// ---------------------------------------------------------------------------

export interface MedicalCondition extends BaseRecord, SoftDeletable {
  patient_id: string;
  condition_name: string;
  icd_code: string | null;
  diagnosed_date: string | null;
  status: ConditionStatus;
  notes: string | null;
}

export interface Allergy extends BaseRecord, SoftDeletable {
  patient_id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string | null;
  confirmed_by_doctor: boolean;
}

export interface Vaccination extends BaseRecord, SoftDeletable {
  patient_id: string;
  vaccine_name: string;
  dose_number: number | null;
  administered_date: string | null;
  administered_by: string | null;
  next_dose_due: string | null;
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

export interface Conversation extends BaseRecord {
  created_by: string;
  participant_ids: string[];
  subject: string | null;
  last_message_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export interface AiChatSession {
  id: string;
  user_id: string | null;
  session_token: string;
  started_at: string;
  ended_at: string | null;
  context_patient_id: string | null;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  session_id: string;
  role: AiMessageRole;
  content: string;
  attachments: unknown[];
  created_at: string;
}

export interface PreVisitTemplate extends BaseRecord, SoftDeletable {
  doctor_user_id: string;
  specialization_id: string | null;
  title: string;
  description: string | null;
  status: PreVisitTemplateStatus;
  is_active: boolean;
  source_bucket: string | null;
  source_path: string | null;
  source_file_name: string | null;
  extraction_metadata: Record<string, unknown>;
  published_at: string | null;
}

export interface PreVisitTemplateQuestion extends BaseRecord {
  template_id: string;
  question_key: string;
  label: string;
  help_text: string | null;
  question_type: PreVisitQuestionType;
  display_order: number;
  is_required: boolean;
  options: unknown[];
  autofill_source: string | null;
  memory_key: string | null;
  ai_instructions: string | null;
}

export interface AppointmentPreVisitAssessment extends BaseRecord {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  template_id: string | null;
  template_title: string;
  template_snapshot: Record<string, unknown>;
  status: PreVisitAssessmentStatus;
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  last_answered_at: string | null;
}

export interface AppointmentPreVisitAnswer extends BaseRecord {
  assessment_id: string;
  question_key: string;
  question_label: string;
  question_type: PreVisitQuestionType;
  answer_text: string | null;
  answer_json: unknown;
  autofill_value: unknown;
  autofill_source: string | null;
  autofilled: boolean;
  confirmed_by_patient: boolean;
  answered_at: string | null;
}

export interface AppointmentPreVisitSummary {
  id: string;
  assessment_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  summary_text: string;
  key_points: unknown[];
  risk_flags: unknown[];
  pending_questions: unknown[];
  generated_by: string;
  generated_at: string;
  updated_at: string;
}

export interface PatientMemoryFact extends BaseRecord {
  patient_id: string;
  source_kind: PatientMemorySourceKind;
  source_record_id: string;
  memory_key: string;
  label: string;
  value_type: PatientMemoryValueType;
  value_text: string | null;
  value_json: unknown;
  status: PatientMemoryStatus;
  confidence: number;
  usable_in_chat: boolean;
  usable_in_forms: boolean;
  confirmed_at: string | null;
  last_used_at: string | null;
  metadata: Record<string, unknown>;
}

export interface PatientCanonicalUpdateRequest extends BaseRecord {
  patient_id: string;
  source_kind: PatientCanonicalUpdateSourceKind;
  source_record_id: string;
  target_field: string;
  display_label: string;
  apply_strategy: PatientCanonicalUpdateStrategy;
  current_value: unknown;
  proposed_value: unknown;
  status: PatientCanonicalUpdateStatus;
  requires_doctor_review: boolean;
  metadata: Record<string, unknown>;
  confirmed_at: string | null;
  applied_at: string | null;
  dismissed_at: string | null;
}

export interface PatientReportedMedication extends BaseRecord, SoftDeletable {
  patient_id: string;
  source_update_request_id: string | null;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  review_status: PatientReportedMedicationReviewStatus;
  is_current: boolean;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface HealthArticle extends BaseRecord {
  title: string;
  slug: string;
  body: string;
  category: string | null;
  author_name: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

// ---------------------------------------------------------------------------
// Insurance
// ---------------------------------------------------------------------------

export interface InsurancePlan extends BaseRecord {
  name: string;
  provider_company: string;
  coverage_type: string | null;
  annual_limit: number | null;
  co_pay_percentage: number | null;
  network_type: string | null;
  is_active: boolean;
}

export interface PatientInsurance extends BaseRecord {
  patient_id: string;
  insurance_plan_id: string;
  policy_number: string | null;
  member_id: string | null;
  card_photo_url: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_primary: boolean;
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

export interface DoctorAvailability extends BaseRecord {
  doctor_id: string;
  facility_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface BlockedSlot extends BaseRecord {
  doctor_id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  table_name: string;
  record_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}

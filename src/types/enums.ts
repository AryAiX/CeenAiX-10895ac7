export type UserRole =
  | 'patient'
  | 'doctor'
  | 'nurse'
  | 'pharmacy'
  | 'lab'
  | 'facility_admin'
  | 'super_admin';

export type AppointmentType = 'in_person' | 'virtual';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export type LabOrderStatus =
  | 'ordered'
  | 'collected'
  | 'processing'
  | 'resulted'
  | 'reviewed';

export type ConditionStatus = 'active' | 'resolved' | 'chronic';

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export type NotificationType =
  | 'appointment'
  | 'medication'
  | 'lab_result'
  | 'system'
  | 'alert';

export type AiMessageRole = 'user' | 'assistant' | 'system';

export type AuditAction = 'create' | 'update' | 'delete' | 'access';

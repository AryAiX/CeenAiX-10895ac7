# 9. Data Model & Schema Design

---

## 9.1 Design Principles

1. **Single `users` table** (Supabase `auth.users`) as the identity anchor. All role-specific data in extension tables joined via `user_id`.
2. **Role-based extension tables**: `patient_profiles`, `doctor_profiles`, `nurse_profiles`, `pharmacy_profiles`, `lab_profiles`, `facility_admin_profiles`.
3. **Facility as first-class entity**: `facilities` table for clinics, hospitals, pharmacies, labs. Staff linked via `facility_staff` junction table.
4. **Immutable audit log**: every mutation logged. Clinical data never hard-deleted — soft-delete with `is_deleted` + `deleted_at`.
5. **UUID primary keys** throughout.
6. **Timestamps on every table**: `created_at`, `updated_at` (auto-managed via triggers).

---

## 9.2 Core Entity List

| Domain | Table Name | Description |
|---|---|---|
| Identity | `auth.users` | Supabase-managed: email, phone, password hash, metadata |
| Identity | `user_profiles` | Shared profile: full_name, date_of_birth, gender, emirates_id, avatar_url, role (enum), phone, address |
| Patient | `patient_profiles` | blood_type, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone |
| Patient | `family_links` | patient_id, linked_user_id, relationship (enum), consent_status, is_guardian |
| Doctor | `doctor_profiles` | license_number, specialization, sub_specialization, years_of_experience, consultation_fee, bio, languages_spoken |
| Nurse | `nurse_profiles` | license_number, department, shift_preference, certifications |
| Facility | `facilities` | name, type (clinic/hospital/pharmacy/laboratory), address, city, phone, email, license_number, dha_status, operating_hours (JSONB) |
| Facility | `facility_staff` | facility_id, user_id, role, department, is_active, joined_at |
| Appointments | `appointments` | patient_id, doctor_id, facility_id, type (in_person/virtual), status (scheduled/confirmed/in_progress/completed/cancelled/no_show), scheduled_at, duration_minutes, chief_complaint, notes |
| Consultations | `consultation_sessions` | appointment_id, started_at, ended_at, recording_consent, transcript_url, ai_summary |
| Consultations | `consultation_notes` | session_id, doctor_id, subjective, objective, assessment, plan (SOAP), ai_generated_draft, doctor_approved |
| Prescriptions | `prescriptions` | patient_id, doctor_id, appointment_id, status (active/completed/cancelled), prescribed_at |
| Prescriptions | `prescription_items` | prescription_id, medication_name, dosage, frequency, duration, quantity, instructions, is_dispensed |
| Pharmacy | `pharmacy_profiles` | facility_id, license_number, delivery_enabled, delivery_radius_km |
| Pharmacy | `dispensing_records` | prescription_item_id, pharmacy_facility_id, dispensed_by, dispensed_at, status |
| Lab | `lab_profiles` | facility_id, license_number, accreditation_status, capabilities (JSONB) |
| Lab | `lab_orders` | patient_id, doctor_id, appointment_id, facility_id, status (ordered/collected/processing/resulted/reviewed), ordered_at |
| Lab | `lab_order_items` | lab_order_id, test_name, test_code, status, result_value, result_unit, reference_range, is_abnormal, resulted_at |
| Lab | `lab_result_files` | lab_order_item_id, file_url, file_type, uploaded_at |
| Imaging | `imaging_records` | patient_id, doctor_id, type, body_part, findings, report_url, image_urls (JSONB), recorded_at |
| Insurance | `insurance_plans` | name, provider_company, coverage_type, annual_limit, co_pay_percentage, network_type, is_active |
| Insurance | `patient_insurance` | patient_id, insurance_plan_id, policy_number, member_id, card_photo_url, valid_from, valid_until, is_primary |
| Insurance | `insurance_claims` | patient_id, insurance_id, appointment_id, claim_type, amount, status, submitted_at |
| Medical Records | `medical_conditions` | patient_id, condition_name, icd_code, diagnosed_date, status (active/resolved/chronic), notes |
| Medical Records | `allergies` | patient_id, allergen, severity (mild/moderate/severe), reaction, confirmed_by_doctor |
| Medical Records | `vaccinations` | patient_id, vaccine_name, dose_number, administered_date, administered_by, facility_id, next_dose_due |
| Medications | `medication_reminders` | patient_id, prescription_item_id, reminder_time, is_active, last_acknowledged_at |
| Messaging | `conversations` | created_by, participant_ids (JSONB), subject, last_message_at |
| Messaging | `messages` | conversation_id, sender_id, body, sent_at, read_at |
| Notifications | `notifications` | user_id, type (enum), title, body, is_read, action_url, created_at |
| Content | `health_articles` | title, slug, body, category, author_name, cover_image_url, is_published, published_at |
| AI | `ai_chat_sessions` | user_id (nullable for guests), session_token, started_at, ended_at, context_patient_id |
| AI | `ai_chat_messages` | session_id, role (user/assistant/system), content, attachments (JSONB), created_at |
| AI | `ai_clinical_suggestions` | consultation_session_id, suggestion_type, content, confidence_score, was_accepted |
| Admin | `audit_logs` | user_id, action, table_name, record_id, old_value (JSONB), new_value (JSONB), ip_address, created_at |
| Admin | `platform_settings` | key, value (JSONB), updated_by, updated_at |
| Scheduling | `doctor_availability` | doctor_id, facility_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active |
| Scheduling | `blocked_slots` | doctor_id, blocked_date, start_time, end_time, reason |
| Payments | `payments` | patient_id, appointment_id, amount, currency, status, payment_method, gateway_transaction_id, paid_at |
| Referrals | `referrals` | patient_id, referring_doctor_id, referred_to_doctor_id, referred_to_specialty, reason, priority, status, created_at |

---

## 9.3 Key Relationships

```
auth.users 1──1 user_profiles
user_profiles 1──0..1 patient_profiles
user_profiles 1──0..1 doctor_profiles
user_profiles 1──0..1 nurse_profiles
facilities 1──* facility_staff
facility_staff *──1 user_profiles
patient_profiles 1──* appointments
doctor_profiles 1──* appointments
appointments 1──0..1 consultation_sessions
consultation_sessions 1──* consultation_notes
appointments 1──* prescriptions
prescriptions 1──* prescription_items
prescription_items 1──0..1 dispensing_records
appointments 1──* lab_orders
lab_orders 1──* lab_order_items
patient_profiles 1──* patient_insurance
patient_insurance *──1 insurance_plans
patient_profiles *──* user_profiles (via family_links)
user_profiles 1──* ai_chat_sessions
ai_chat_sessions 1──* ai_chat_messages
user_profiles 1──* notifications
```

---

## 9.4 Key Schema Decisions

1. **Single `user_profiles` + role extensions** vs. separate identity tables per role. A user's core identity is universal; role-specific fields live in extension tables. Avoids duplication, simplifies cross-role queries.

2. **JSONB for semi-structured data** (operating_hours, attachments, AI content). Normalized tables for queryable structured data (lab results, prescriptions, appointments).

3. **Soft delete for all clinical data** (`is_deleted` + `deleted_at`). Hard delete only for non-clinical transient data. Required for regulatory compliance and audit.

4. **Appointment as the central clinical event**. Consultations, prescriptions, lab orders, referrals, and payments all reference an appointment — creating a clean audit chain from booking to billing.

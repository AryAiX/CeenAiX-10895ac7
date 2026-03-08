# Database Schema Quick Reference

> Condensed from `docs/specs/09-data-model.md`. All tables use UUID PKs, `created_at`/`updated_at` timestamps, and soft-delete (`is_deleted`/`deleted_at`) for clinical data.

## Phase 1 Tables (MVP)

### Identity & Profiles

```
auth.users (Supabase-managed)
  - id, email, phone, encrypted_password, raw_user_meta_data

user_profiles
  - id (PK), user_id (FK → auth.users, unique), role (enum: patient/doctor/nurse/pharmacy/lab/facility_admin/super_admin)
  - full_name, first_name, last_name, date_of_birth, gender, emirates_id (encrypted)
  - phone, email, address, city, avatar_url
  - notification_preferences (JSONB), profile_completed (bool), terms_accepted (bool)

patient_profiles
  - id (PK), user_id (FK → auth.users, unique)
  - blood_type, emergency_contact_name, emergency_contact_phone

doctor_profiles
  - id (PK), user_id (FK → auth.users, unique)
  - license_number, specialization, sub_specialization, years_of_experience
  - consultation_fee, bio, languages_spoken (JSONB)
  - dha_license_verified (bool), dha_verified_at
```

### Clinical

```
appointments
  - id (PK), patient_id (FK → auth.users), doctor_id (FK → auth.users), facility_id (FK → facilities, nullable)
  - type (enum: in_person/virtual), status (enum: scheduled/confirmed/in_progress/completed/cancelled/no_show)
  - scheduled_at (timestamptz), duration_minutes, chief_complaint, notes

consultation_notes
  - id (PK), appointment_id (FK), doctor_id (FK → auth.users)
  - subjective, objective, assessment, plan (text — SOAP)
  - ai_generated_draft (text), doctor_approved (bool)

prescriptions
  - id (PK), patient_id (FK), doctor_id (FK), appointment_id (FK)
  - status (enum: active/completed/cancelled), prescribed_at

prescription_items
  - id (PK), prescription_id (FK)
  - medication_name, dosage, frequency, duration, quantity, instructions
  - is_dispensed (bool)

lab_orders
  - id (PK), patient_id (FK), doctor_id (FK), appointment_id (FK)
  - status (enum: ordered/collected/processing/resulted/reviewed), ordered_at

lab_order_items
  - id (PK), lab_order_id (FK)
  - test_name, test_code, status, result_value, result_unit, reference_range
  - is_abnormal (bool), resulted_at
```

### Medical Records

```
medical_conditions
  - id (PK), patient_id (FK → auth.users)
  - condition_name, icd_code, diagnosed_date, status (enum: active/resolved/chronic), notes

allergies
  - id (PK), patient_id (FK → auth.users)
  - allergen, severity (enum: mild/moderate/severe), reaction, confirmed_by_doctor (bool)

vaccinations
  - id (PK), patient_id (FK → auth.users)
  - vaccine_name, dose_number, administered_date, administered_by, next_dose_due
```

### Messaging

```
conversations
  - id (PK), created_by (FK → auth.users), participant_ids (JSONB), subject, last_message_at

messages
  - id (PK), conversation_id (FK), sender_id (FK → auth.users)
  - body (text), sent_at, read_at
```

### Notifications

```
notifications
  - id (PK), user_id (FK → auth.users)
  - type (enum: appointment/medication/lab_result/system/alert)
  - title, body, is_read (bool), action_url, created_at
```

### AI

```
ai_chat_sessions
  - id (PK), user_id (FK → auth.users, nullable for guests)
  - session_token (unique), started_at, ended_at
  - context_patient_id (FK, nullable — for family member acting on behalf)

ai_chat_messages
  - id (PK), session_id (FK → ai_chat_sessions)
  - role (enum: user/assistant/system), content (text), attachments (JSONB), created_at
```

### Content

```
health_articles
  - id (PK), title, slug (unique), body, category, author_name
  - cover_image_url, is_published (bool), published_at
```

### Insurance (read-only for patients in MVP)

```
insurance_plans
  - id (PK), name, provider_company, coverage_type, annual_limit
  - co_pay_percentage, network_type, is_active (bool)

patient_insurance
  - id (PK), patient_id (FK), insurance_plan_id (FK)
  - policy_number, member_id, card_photo_url, valid_from, valid_until, is_primary (bool)
```

### Scheduling

```
doctor_availability
  - id (PK), doctor_id (FK → auth.users), facility_id (FK, nullable)
  - day_of_week (int 0-6), start_time (time), end_time (time), slot_duration_minutes, is_active (bool)

blocked_slots
  - id (PK), doctor_id (FK), blocked_date, start_time, end_time, reason
```

### Admin

```
audit_logs
  - id (PK), user_id (FK), action (enum: create/update/delete/access)
  - table_name, record_id, old_value (JSONB), new_value (JSONB), ip_address, created_at

platform_settings
  - id (PK), key (unique), value (JSONB), updated_by (FK), updated_at
```

---

## Phase 2+ Tables (DO NOT create in MVP)

```
family_links              — Phase 2 (family management)
consultation_sessions     — Phase 2 (virtual consultation + transcription)
ai_clinical_suggestions   — Phase 2 (real-time AI diagnosis)
payments                  — Phase 2 (Stripe)
referrals                 — Phase 2 (doctor-to-doctor)
medication_reminders      — Phase 2 (push notifications)
nurse_profiles            — Phase 3
pharmacy_profiles         — Phase 3
lab_profiles              — Phase 3
facilities                — Phase 3
facility_staff            — Phase 3
dispensing_records        — Phase 3
lab_result_files          — Phase 3
imaging_records           — Phase 3
insurance_claims          — Phase 3
```

---

## RLS Pattern

Every table with patient data uses this RLS pattern:

```sql
-- Patients see their own data
CREATE POLICY "patients_own_data" ON table_name
  FOR ALL USING (auth.uid() = patient_id);

-- Doctors see data for patients they have appointments with
CREATE POLICY "doctors_via_appointment" ON table_name
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = table_name.patient_id
    )
  );
```

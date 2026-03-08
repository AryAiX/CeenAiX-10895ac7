# Routes Quick Reference

> MVP routes only. Full route map in `docs/specs/14-route-map.md`.
> For Bolt code conflicts, see `docs/agent/bolt-code-audit.md`.

## Code Status Legend

- **live** — Route exists in code and queries Supabase
- **ui-only** — Route exists in code but uses static/mock data
- **not-started** — Route is in the MVP spec but has no code yet
- **bolt-extra** — Route exists in Bolt code but is NOT in MVP spec (defer or remove)

## Public (no auth)

| Route | Component | Code Status | Notes |
|---|---|---|---|
| `/` | Home | ui-only | Static landing page |
| `/ai-chat` | AIChat | ui-only | Local rule-based responses; needs Edge Function replacement |
| `/find-doctor` | FindDoctor | live | Queries Bolt `doctors` table (needs migration to `doctor_profiles` + `user_profiles`) |
| `/find-clinic` | FindClinic | live | Queries Bolt `hospitals` table (Phase 3 per spec; hardcode for MVP) |
| `/insurance` | Insurance | ui-only | Static plans; needs wiring to `insurance_plans` |
| `/health-education` | HealthEducation | ui-only | Static articles; needs wiring to `health_articles` |
| `/pharmacy` | Pharmacy | bolt-extra | Not in MVP spec; remove from MVP router |
| `/laboratories` | Laboratories | bolt-extra | Phase 3 per spec; remove from MVP router |
| `/appointment-showcase` | AppointmentDesignShowcase | bolt-extra | Design demo; remove before production |
| `/about` | — | not-started | |

## Auth

| Route | Component | Code Status | Notes |
|---|---|---|---|
| `/auth/login` | Login | not-started | Email/password + OTP; redirect by role |
| `/auth/register` | Register | not-started | Multi-step wizard |
| `/auth/forgot-password` | ForgotPassword | not-started | Email reset link |
| `/auth/verify-otp` | VerifyOTP | not-started | Shared OTP screen |
| `/auth/onboarding` | Onboarding | not-started | Role-adaptive; skippable |

## Patient (auth required, role=patient)

| Route | Component | Code Status | Key Data |
|---|---|---|---|
| `/patient/dashboard` | PatientDashboard | ui-only | Static mock data; needs custom hooks |
| `/patient/ai-chat` | PatientAIChat | not-started | ai_chat_sessions, ai_chat_messages |
| `/patient/appointments` | PatientAppointments | live | Queries Bolt `appointments` + `doctors` (needs schema migration) |
| `/patient/appointments/book` | BookAppointment | not-started | doctor_availability, blocked_slots |
| `/patient/appointments/:id` | AppointmentDetail | not-started | Single appointment + consultation_notes |
| `/patient/records` | PatientRecords | ui-only | Static data; needs wiring to medical_conditions, allergies, vaccinations |
| `/patient/lab-results` | PatientLabResults | not-started | lab_orders + lab_order_items (patient_id = me) |
| `/patient/lab-results/:id` | LabResultDetail | not-started | Single lab order |
| `/patient/prescriptions` | PatientPrescriptions | live | Queries Bolt `prescriptions` + `doctors` (needs normalization) |
| `/patient/messages` | PatientMessages | ui-only | Static conversation list; needs wiring to conversations, messages |
| `/patient/messages/:id` | ConversationDetail | not-started | Single conversation |
| `/patient/notifications` | NotificationCenter | not-started | notifications (user_id = me) |
| `/patient/emergency-profile` | EmergencyProfile | not-started | patient_profiles emergency fields |
| `/patient/profile` | PatientProfile | ui-only | Local state only; needs wiring to user_profiles, patient_profiles, patient_insurance |

## Doctor (auth required, role=doctor)

| Route | Component | Code Status | Key Data |
|---|---|---|---|
| `/doctor/dashboard` | DoctorDashboard | ui-only | All zeros; needs aggregated queries |
| `/doctor/patients` | DoctorPatients | ui-only | Static list; needs query via appointments join |
| `/doctor/patients/:id` | PatientDetail | not-started | Patient's full health record |
| `/doctor/appointments` | DoctorAppointments | ui-only | Static list; needs Supabase query |
| `/doctor/appointments/:id` | DoctorAppointmentDetail | not-started | Appointment + notes |
| `/doctor/prescriptions` | DoctorPrescriptions | ui-only | Empty state; needs Supabase query |
| `/doctor/prescriptions/new` | CreatePrescription | not-started | Creates prescription + items |
| `/doctor/lab-orders` | DoctorLabOrders | not-started | lab_orders (doctor_id = me) |
| `/doctor/lab-orders/new` | CreateLabOrder | not-started | Creates lab_order + items |
| `/doctor/schedule` | DoctorSchedule | not-started | doctor_availability, blocked_slots |
| `/doctor/messages` | DoctorMessages | ui-only | Empty state; needs wiring |
| `/doctor/messages/:id` | ConversationDetail | not-started | Single conversation |
| `/doctor/notifications` | NotificationCenter | not-started | notifications (user_id = me) |
| `/doctor/profile` | DoctorProfile | live | Queries Bolt `profiles` table (needs migration to `user_profiles` + `doctor_profiles`) |

## Admin (auth required, role=super_admin)

| Route | Component | Code Status |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | not-started |
| `/admin/users` | UserManagement | not-started |
| `/admin/insurance` | InsuranceManagement | not-started |

## System

| Route | Component | Code Status |
|---|---|---|
| `/404` | NotFound | not-started |
| `/500` | ServerError | not-started |
| `/maintenance` | Maintenance | not-started |
| `/access-denied` | AccessDenied | not-started |

## Route Guards

All `/patient/*` routes require `role === 'patient'`.
All `/doctor/*` routes require `role === 'doctor'`.
All `/admin/*` routes require `role === 'super_admin'`.
Unauthorized access redirects to `/access-denied`.
Unauthenticated access redirects to `/auth/login`.

> **Note**: No route guards exist in code yet. All pages are currently accessible without authentication.

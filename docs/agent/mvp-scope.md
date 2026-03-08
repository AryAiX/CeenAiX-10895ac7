# MVP Scope (Phase 1)

> What to build NOW. If a feature is not listed here, it is Phase 2+. Do NOT implement Phase 2+ features unless explicitly asked.

## Roles in MVP

Guest, Patient, Doctor, Super Admin (minimal).

## Public Pages

- `/` — Landing page (hero, features, CTA)
- `/ai-chat` — AI Health Agent (guest mode, no login required)
- `/find-doctor` — Search doctors by specialty, location, availability (data from Supabase)
- `/find-clinic` — Browse clinic profiles
- `/insurance` — Browse insurance plans (read-only)
- `/health-education` — Health articles (static content)

## Auth Pages

- `/auth/login` — Email/password + mobile OTP login
- `/auth/register` — Multi-step: method → OTP → role selection → profile → dashboard
- `/auth/forgot-password` — Email → reset link → new password
- `/auth/verify-otp` — Shared OTP input screen
- `/auth/onboarding` — Post-registration guided setup (skippable)

## Patient Pages

- `/patient/dashboard` — Health overview, upcoming appointments, medication reminders, AI chat entry point
- `/patient/ai-chat` — Full AI chat with patient context, document upload, pre-visit assessment
- `/patient/appointments` — List upcoming/past; book in-person appointments; cancel/reschedule
- `/patient/appointments/book` — Booking flow: select doctor → date → time → confirm
- `/patient/appointments/:id` — Appointment detail
- `/patient/records` — Personal health record (manual entry): conditions, allergies, medications, vaccinations
- `/patient/lab-results` — View doctor-uploaded results; AI plain-language explanation
- `/patient/prescriptions` — View active/past prescriptions (doctor-issued)
- `/patient/messages` — Secure text messaging with doctors
- `/patient/messages/:id` — Conversation detail
- `/patient/notifications` — Notification center
- `/patient/profile` — Personal info, Emirates ID, notification preferences

## Doctor Pages

- `/doctor/dashboard` — Today's appointments, patient queue, unread messages
- `/doctor/patients` — Search patients, view health records (with consent)
- `/doctor/patients/:id` — Patient profile and records
- `/doctor/appointments` — View schedule, manage availability (in-person only)
- `/doctor/appointments/:id` — Appointment detail
- `/doctor/prescriptions` — View/create digital prescriptions
- `/doctor/prescriptions/new` — Create prescription form
- `/doctor/lab-orders` — Create lab orders (stored in patient record; lab integration Phase 3)
- `/doctor/lab-orders/new` — Create lab order form
- `/doctor/schedule` — Availability and calendar management
- `/doctor/messages` — Secure messaging with patients
- `/doctor/messages/:id` — Conversation detail
- `/doctor/notifications` — Notification center
- `/doctor/profile` — Professional profile, bio, availability

## Admin Pages (Minimal)

- `/admin/dashboard` — Basic platform overview
- `/admin/users` — Create/edit/suspend user accounts
- `/admin/insurance` — CRUD insurance plans

## Database Tables for MVP

See `docs/agent/schema-reference.md` — use only tables marked **Phase 1**.

## Infrastructure

- Supabase Auth: email + phone (OTP) providers
- Supabase Storage: buckets for `avatars`, `documents`, `medical-files`
- Edge Functions: `ai-chat` (chat completion + streaming), `ai-document-analyze` (OCR/vision), `ai-embed` (embeddings)
- RLS policies on all tables scoped by `auth.uid()` and role
- CI/CD: GitHub Actions → lint + typecheck + build → deploy to Vercel

## Current Code State (Bolt Prototype)

> The UI was prototyped using Bolt. This section tracks what exists in code vs what still needs to be built. See `docs/agent/bolt-code-audit.md` for detailed conflict analysis.

### What Bolt Has Built

**Working with Supabase (but wrong schema)**:
- FindDoctor — queries `doctors` (needs migration to `doctor_profiles` + `user_profiles`)
- FindClinic — queries `hospitals` (Phase 3 table; hardcode for MVP)
- PatientAppointments — queries `appointments` + `doctors` + `doctor_ratings` (schema mismatch)
- PatientPrescriptions — queries `prescriptions` + `doctors` (flat vs normalized)
- DoctorProfile — queries `profiles` (needs migration to `user_profiles`)
- BookingModal — inserts into `appointments` (column mismatch)

**UI-only (static/mock data)**:
- Home, Insurance, HealthEducation, Pharmacy, Laboratories
- PatientDashboard, PatientRecords, PatientMessages, PatientProfile
- DoctorDashboard, DoctorAppointments, DoctorPatients, DoctorPrescriptions, DoctorMessages
- AIChat (local rule-based, no Edge Functions)

**Extra pages not in MVP spec**:
- `/pharmacy` — defer to Phase 3
- `/laboratories` — defer to Phase 3
- `/appointment-showcase` — design demo, remove

### What Still Needs to Be Built

| Category | Items | Priority |
|---|---|---|
| Database | Supabase migrations for all Phase 1 tables, RLS policies | Highest |
| Auth | `auth-context.tsx`, login, register, OTP, forgot-password, onboarding, route guards | Highest |
| Shared types | `src/types/` matching spec schema | High |
| Custom hooks | `src/hooks/` for Supabase queries | High |
| Schema migration | Rewire existing Bolt queries to use spec tables | High |
| AI backend | Edge Functions (ai-chat, ai-document-analyze, ai-embed) | High |
| Missing pages | Admin (dashboard, users, insurance), patient (ai-chat, lab-results, notifications, emergency-profile, booking flow), doctor (patient detail, create prescription, lab orders, schedule, notifications) | High |
| System pages | 404, 500, maintenance, access-denied | Medium |
| Storage | Supabase Storage buckets (avatars, documents, medical-files) | Medium |
| CI/CD | GitHub Actions pipeline | Medium |

### Guiding Principle

Bolt's UI components are the **visual reference** — preserve their look and feel. Replace data-fetching, types, and business logic to match the spec. See `AGENTS.md` for the full rule.

## NOT in MVP

- Virtual consultation (video/audio) — Phase 2
- Live AI transcription / recording — Phase 2
- Family member accounts — Phase 2
- Payments (Stripe) — Phase 2
- Arabic / RTL — Phase 2
- Push notifications (FCM) — Phase 2
- Nurse, Pharmacy, Lab, Facility Admin roles — Phase 3
- DHA Nabidh/Salama integration — Phase 3
- UAE Pass — Phase 3
- Insurance claims processing — Phase 3
- Emergency access — Phase 3
- Analytics dashboards — Phase 4

# Bolt Code Audit — Conflicts & Migration Guide

> The product lead uses **Bolt** to prototype the UI. This document maps every conflict between the Bolt-generated code and the product spec. Use it when implementing real features to know what to keep, replace, or build from scratch.

## Guiding Principle

| Concern | Authority |
|---|---|
| Visual design, layout, component structure | **Code** (Bolt) |
| Domain model, data schema, business logic | **Spec** (docs/specs/) |
| Routing paths, auth flows, AI integration | **Spec** |
| UX flow (step order, screens shown) | **Spec** |

**In practice**: preserve Bolt's JSX/Tailwind rendering but replace the data layer, types, auth, and business logic to match the spec.

---

## 1. Database Table Conflicts

Bolt code queries ad-hoc tables that differ from the spec schema.

| Bolt Table | Code Files | Spec Table(s) | Migration Action |
|---|---|---|---|
| `doctors` | FindDoctor, FindClinic, Appointments, Prescriptions | `user_profiles` + `doctor_profiles` (joined via `user_id`) | Create a Supabase **view** `doctors_view` joining `user_profiles` and `doctor_profiles`, or refactor queries to join both tables |
| `hospitals` | FindClinic | `facilities` (Phase 3) | For MVP: hardcode or use a simple `facilities` table if clinics are needed; otherwise defer to Phase 3 |
| `hospital_doctors` | FindClinic | `facility_staff` (Phase 3) | Defer to Phase 3 |
| `laboratories` | Laboratories | `lab_profiles` (Phase 3) | Defer; page uses static fallback already |
| `profiles` | DoctorProfile | `user_profiles` | Rename to `user_profiles`; adjust column set to match spec |
| `doctor_ratings` | PatientAppointments | **Not in spec** | Add `rating` / `rating_comment` / `rated_at` columns to `appointments` table, or create a dedicated `doctor_ratings` spec table. Discuss with product lead. |

### Column-Level Mismatches

**appointments**

| Bolt Column | Spec Column | Notes |
|---|---|---|
| `doctor_name` | — | Denormalized; join `user_profiles` instead |
| `appointment_date` (date string) | `scheduled_at` (timestamptz) | Combine `appointment_date` + `appointment_time` into single `scheduled_at` |
| `appointment_time` (time string) | — | Merged into `scheduled_at` |
| `location` | `facility_id` (FK) | Replace with FK reference |
| `reason` | `chief_complaint` | Rename |
| `type`: in-person/video/phone | `type`: in_person/virtual | Normalize to spec enum; "phone" not a separate type |
| `rating` | — | Not on appointments in spec (see `doctor_ratings` above) |
| — | `duration_minutes` | Add to appointment creation |
| — | `notes` | Add |
| — | `status` enum | Spec adds `confirmed`, `in_progress`, `no_show` beyond Bolt's set |

**prescriptions**

| Bolt Structure | Spec Structure |
|---|---|
| Flat: `medication_name`, `dosage`, `frequency`, `duration`, `instructions` on `prescriptions` row | Normalized: `prescriptions` (header) + `prescription_items` (line items) |

Migration: split Bolt's flat prescription into header + items when creating the real schema.

---

## 2. Route Conflicts

### Routes in code but NOT in spec

| Route | Page | Disposition |
|---|---|---|
| `/appointment-showcase` | AppointmentDesignShowcase | Remove before production (design demo) |
| `/pharmacy` | Pharmacy | Not in MVP spec; keep code for later but remove from router in MVP |
| `/laboratories` | Laboratories | Phase 3 per spec; keep code, remove from MVP router |

### Routes in spec MVP but NOT in code

| Route | Phase | Priority |
|---|---|---|
| `/auth/login` | MVP | High — required for any auth |
| `/auth/register` | MVP | High |
| `/auth/forgot-password` | MVP | Medium |
| `/auth/verify-otp` | MVP | High |
| `/auth/onboarding` | MVP | Medium |
| `/patient/ai-chat` | MVP | High — patient-context AI |
| `/patient/appointments/book` | MVP | High |
| `/patient/appointments/:id` | MVP | Medium |
| `/patient/lab-results` | MVP | Medium |
| `/patient/lab-results/:id` | MVP | Low |
| `/patient/notifications` | MVP | Medium |
| `/patient/emergency-profile` | MVP | Low |
| `/patient/messages/:id` | MVP | Low |
| `/doctor/patients/:id` | MVP | High |
| `/doctor/appointments/:id` | MVP | Medium |
| `/doctor/prescriptions/new` | MVP | High |
| `/doctor/lab-orders` | MVP | Medium |
| `/doctor/lab-orders/new` | MVP | Medium |
| `/doctor/schedule` | MVP | Medium |
| `/doctor/notifications` | MVP | Medium |
| `/doctor/messages/:id` | MVP | Low |
| `/admin/dashboard` | MVP | Medium |
| `/admin/users` | MVP | High |
| `/admin/insurance` | MVP | Medium |
| `/about` | MVP | Low |
| `/404` | MVP | Low |
| `/500` | MVP | Low |
| `/maintenance` | MVP | Low |
| `/access-denied` | MVP | Medium — needed for auth guards |

---

## 3. Type System Conflicts

Bolt defines types inline per component. Spec expects a shared type layer in `src/types/`.

| Entity | Bolt Definition | Spec Definition | Migration |
|---|---|---|---|
| Doctor | `{ id, name, specialty, location, image_url, rating, accepts_video }` | `user_profiles` (full_name, avatar_url) + `doctor_profiles` (specialization, license_number, consultation_fee, bio, languages_spoken) | Create `src/types/doctor.ts`; update components |
| Appointment | `{ id, user_id, doctor_id, doctor_name, appointment_date, appointment_time, type, location, reason, status, rating }` | `{ id, patient_id, doctor_id, facility_id, type, status, scheduled_at, duration_minutes, chief_complaint, notes }` | Create `src/types/appointment.ts` |
| Prescription | Flat: `{ id, medication_name, dosage, ... }` | Header + items: `prescriptions` + `prescription_items` | Create `src/types/prescription.ts` |
| Hospital/Facility | `{ id, name, type, address, city, phone, email, image_url, rating, facilities, specialties }` | `facilities` (Phase 3 table) | Defer; keep Bolt's type as placeholder |
| Message | `{ id, role, content, timestamp, suggestions }` (AI chat) | `ai_chat_messages` (session_id, role, content, attachments) | Create `src/types/ai.ts` |

**Missing shared types to create**: `User`, `UserProfile`, `PatientProfile`, `DoctorProfile`, `Appointment`, `ConsultationNote`, `Prescription`, `PrescriptionItem`, `LabOrder`, `LabOrderItem`, `Conversation`, `Message`, `Notification`, `AIChatSession`, `AIChatMessage`.

---

## 4. Auth Conflicts

| Area | Bolt Code | Spec Requirement |
|---|---|---|
| Auth state | No context; inline `supabase.auth.getUser()` in 3 components | `AuthContext` in `src/lib/auth-context.tsx`; wraps app |
| Auth routes | None | 5 routes: login, register, forgot-password, verify-otp, onboarding |
| Route guards | None; all pages accessible | Guards per role; redirect to `/auth/login` or `/access-denied` |
| Session persistence | Not handled | Supabase `onAuthStateChange` listener |
| Role detection | Not implemented | `user_profiles.role` enum lookup after auth |

**Migration**: Build auth from scratch per spec. Bolt code is auth-unaware by design.

---

## 5. AI Conflicts

| Area | Bolt Code | Spec Requirement |
|---|---|---|
| Backend | Local rule-based keyword matching in `AIChat.tsx` | Supabase Edge Functions (`ai-chat`, `ai-document-analyze`, `ai-embed`) calling OpenAI GPT-4o |
| Streaming | None | SSE streaming from Edge Function |
| Storage | Component state only | `ai_chat_sessions` + `ai_chat_messages` tables |
| Document analysis | None | GPT-4o Vision via `ai-document-analyze` Edge Function |
| Patient context | None | Authenticated sessions include patient medical history with consent |
| Guest sessions | No persistence | Session token stored; auto-delete after 30 days |

**Migration**: Replace `AIChat.tsx` response logic with Edge Function calls. Keep the chat UI (message list, input, suggestions).

---

## 6. Navigation Conflicts

| Area | Bolt Code | Spec Requirement |
|---|---|---|
| Public header | Shows "Patient Dashboard" + "Doctor Dashboard" links to all visitors | Auth-aware: show Login/Register when unauthenticated; show role-specific dashboard link when authenticated |
| Role navigation | `Navigation.tsx` accepts `role` prop but no auth integration | Navigation driven by `AuthContext` role |
| Pharmacy/Labs in public nav | Visible in header | Pharmacy: not in MVP; Labs: Phase 3 |

**Migration**: When auth is built, make header auth-aware. Remove Pharmacy/Labs from MVP nav.

---

## 7. Pages — Data Layer Status

| Page | Bolt Data Source | Spec Data Source | Effort |
|---|---|---|---|
| FindDoctor | Supabase `doctors` | `user_profiles` + `doctor_profiles` | Medium — change query |
| FindClinic | Supabase `hospitals` + `hospital_doctors` | `facilities` (Phase 3) | Low — hardcode for MVP |
| Laboratories | Supabase `laboratories` with static fallback | Phase 3 | None — defer |
| PatientAppointments | Supabase `appointments` + `doctors` + `doctor_ratings` | Spec `appointments` + joined profiles | High — schema change |
| PatientPrescriptions | Supabase `prescriptions` + `doctors` | Spec `prescriptions` + `prescription_items` | Medium — normalize |
| DoctorProfile | Supabase `profiles` | `user_profiles` + `doctor_profiles` | Medium — change table |
| BookingModal | Supabase `appointments` insert | Same table, different columns | Medium — column mapping |
| PatientDashboard | Static/mock | Spec tables via custom hooks | High — build from scratch |
| PatientRecords | Static | `medical_conditions`, `allergies`, `vaccinations` | High — build from scratch |
| PatientMessages | Static | `conversations`, `messages` | High — build from scratch |
| PatientProfile | Local state only | `user_profiles`, `patient_profiles`, `patient_insurance` | High — build from scratch |
| DoctorDashboard | Static (zeros) | Aggregated queries | High — build from scratch |
| DoctorAppointments | Static | Spec `appointments` | High — build from scratch |
| DoctorPatients | Static | Patients via appointments join | High — build from scratch |
| DoctorPrescriptions | Empty | Spec `prescriptions` | High — build from scratch |
| DoctorMessages | Empty | `conversations`, `messages` | High — build from scratch |
| Insurance | Static | `insurance_plans` | Medium — wire to Supabase |
| HealthEducation | Static | `health_articles` | Medium — wire to Supabase |
| Pharmacy | Static | Phase 3 | None — defer |
| AIChat | Local rules | Edge Functions + OpenAI | High — replace logic |

---

## 8. Missing Infrastructure

These spec requirements have no code at all yet:

| Item | Spec Reference | Priority |
|---|---|---|
| Supabase migrations (SQL files) | `docs/agent/schema-reference.md` | Highest — must exist before wiring data |
| RLS policies | `docs/agent/schema-reference.md` | Highest — security requirement |
| `src/lib/auth-context.tsx` | `AGENTS.md` | Highest — auth prerequisite |
| `src/hooks/` directory | `AGENTS.md` | High — convention for data hooks |
| `src/types/` directory | `AGENTS.md` | High — shared type layer |
| Edge Functions (`ai-chat`, `ai-document-analyze`, `ai-embed`) | `docs/agent/ai-reference.md` | High |
| Supabase Storage buckets (avatars, documents, medical-files) | `docs/agent/mvp-scope.md` | Medium |
| Error boundaries | `AGENTS.md` | Medium |
| Skeleton loaders | `AGENTS.md` | Medium |
| CI/CD (GitHub Actions) | `docs/specs/08-technical-architecture.md` | Medium |

---

## Summary: Recommended Build Order

1. **Schema & migrations** — create all Phase 1 tables with RLS
2. **Auth context & routes** — `auth-context.tsx`, login, register, OTP, guards
3. **Shared types** — `src/types/` matching the spec schema
4. **Custom hooks** — `src/hooks/` for Supabase queries
5. **Rewire existing pages** — replace Bolt queries with spec-compliant ones
6. **Build missing MVP pages** — admin, lab results, schedule, notifications, etc.
7. **AI Edge Functions** — replace local chat logic with OpenAI via Supabase
8. **System pages** — 404, 500, maintenance, access-denied

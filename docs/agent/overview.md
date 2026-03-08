# CeenAiX — Agent Overview

> Quick-reference for AI coding agents. For full details, see `docs/specs/`.

## What is CeenAiX?

AI-native healthcare platform for the UAE market. Patients find doctors, book appointments, consult via video, manage health records — all with an embedded AI assistant. Doctors get AI-assisted consultations with live transcription and SOAP note generation.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS 3 |
| Routing | React Router 7 |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions + Realtime) |
| AI | OpenAI GPT-4o (chat, clinical support, OCR), Whisper (transcription), text-embedding-3-small (search) |
| Video | LiveKit (WebRTC SFU) — Phase 2 |
| Payments | Stripe — Phase 2 |
| Notifications | FCM (push), Twilio (SMS/OTP), Resend (email) |
| Hosting | Vercel (frontend) + Supabase Cloud |

## User Roles

| Role | Phase | Description |
|---|---|---|
| Guest | 1 | Unauthenticated user — AI chat, browse doctors/clinics/insurance |
| Patient | 1 | Primary end-user — dashboard, appointments, records, prescriptions, AI chat |
| Doctor | 1 | Clinical user — patient management, consultations, prescriptions, lab orders |
| Family Member | 2 | Manages dependents' health records and appointments |
| Nurse | 3 | Triage, vitals recording, patient queue management |
| Doctor's Assistant | 3 | Administrative support for doctors |
| Pharmacy | 3 | Prescription dispensing, inventory, delivery |
| Laboratory | 3 | Lab orders, sample tracking, result entry |
| Facility Admin | 3 | Clinic/hospital administration |
| Super Admin | 1 (minimal) | Platform-wide management (AryAiX internal) |

## Current Build Phase: MVP (Phase 1)

See `docs/agent/mvp-scope.md` for exactly what to build now.

## Key Architecture Decisions

1. **Single `user_profiles` table + role extension tables** (not separate user tables per role)
2. **Appointment is the central clinical entity** — consultations, prescriptions, lab orders, payments all reference it
3. **Supabase RLS** for all data access control — no application-level auth bypass
4. **All AI calls proxied through Edge Functions** — frontend never calls OpenAI directly
5. **PWA-first** — no native mobile app in Phase 1-2
6. **Soft delete** for all clinical data (`is_deleted` + `deleted_at`)

## File References

| Need | File |
|---|---|
| What to build now | `docs/agent/mvp-scope.md` |
| Database tables | `docs/agent/schema-reference.md` |
| All routes | `docs/agent/routes-reference.md` |
| Tech decisions | `docs/agent/tech-stack.md` |
| AI features | `docs/agent/ai-reference.md` |
| Full user roles | `docs/specs/02-user-roles.md` |
| All user flows | `docs/specs/04-user-flows.md` |
| Full architecture | `docs/specs/08-technical-architecture.md` |
| Full data model | `docs/specs/09-data-model.md` |
| All integrations | `docs/specs/10-integrations.md` |
| NFRs | `docs/specs/11-non-functional-requirements.md` |
| Phased roadmap | `docs/specs/13-phased-roadmap.md` |
| Complete route map | `docs/specs/14-route-map.md` |

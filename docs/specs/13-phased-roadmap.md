# 13. Phased Delivery Roadmap

---

## 13.1 Phase 1 — MVP (8-10 weeks)

**Goal**: Launch a functional patient-doctor platform with AI chat, appointment booking, and basic medical records.

**Roles**: Guest, Patient, Doctor, Super Admin (minimal)

### Public Zone
- Landing page with platform overview
- AI Health Agent (guest mode) — chat, symptom assessment, doctor recommendation
- Find a Doctor — search by specialty, location, availability
- Find a Clinic — browse facility profiles
- Health Education — static articles
- Insurance Plans — browse (read-only)

### Authentication
- Patient registration: email + OTP, mobile + OTP
- Patient login / logout
- Doctor login (accounts pre-created by admin)
- Password reset, session management (JWT refresh)

### Patient Zone
- Dashboard — health overview, upcoming appointments, medication reminders, AI chat entry
- AI Health Agent (authenticated) — full chat with patient context, document upload, pre-visit assessment
- Appointments — book in-person, view upcoming/past, cancel/reschedule
- Medical Records — PHR (manual entry): conditions, allergies, medications, vaccinations
- Lab Results — view (doctor-uploaded); AI explanation
- Prescriptions — view active/past (doctor-issued)
- Profile & Settings — personal info, Emirates ID, notification preferences
- Messages — secure text messaging with doctors

### Doctor Zone
- Dashboard — today's appointments, patient queue, unread messages
- Patient Profiles — search, view health record (with consent)
- Appointments — view schedule, manage availability (in-person only)
- Consultation Notes — create SOAP notes (manual; AI-assisted in Phase 2)
- Prescriptions — create and send digital prescriptions
- Lab Orders — create (sent to patient record; lab integration in Phase 3)
- Messages — secure messaging with patients
- Profile — professional profile, bio, availability

### Admin (Minimal)
- Super Admin login
- User management — create/edit/suspend accounts
- Doctor account creation and basic onboarding
- Insurance plan management (CRUD)

### Infrastructure
- Canonical schema (core tables only)
- RLS policies for patient and doctor roles
- Supabase Auth with email and phone providers
- Supabase Storage for profile photos, documents, medical files
- AI Edge Functions: chat completion, document analysis (OCR), embedding search
- CI/CD pipeline: lint, typecheck, build, deploy

---

## 13.2 Phase 2 — Clinical Depth & Virtual Care (6-8 weeks)

**New role**: Family Member / Guardian

### Key additions:
- **Virtual consultation** — LiveKit WebRTC video/audio, waiting room, screen sharing
- **AI live transcription** (Whisper API) and real-time diagnosis suggestions
- **AI SOAP note generation** from consultation transcript
- **Family management** — link dependents, AI agent on behalf, consent management
- **Payments** — Stripe for consultation fees, refunds on cancellation
- **Push notifications** — FCM, in-app notification center, preference management
- **Arabic / RTL** — full localization with react-i18next
- **Referral management** and doctor availability calendar
- **Admin enhancements** — provider onboarding workflow, facility management, content management

---

## 13.3 Phase 3 — Full Ecosystem & Compliance (8-12 weeks)

**New roles**: Nurse, Doctor's Assistant, Pharmacy, Laboratory, Clinic/Hospital Admin

### Key additions:
- **Nurse workflows** — triage, vitals, medication administration, shift notes
- **Pharmacy integration** — prescription inbox, dispensing, inventory, delivery
- **Laboratory integration** — test order inbox, sample tracking, result entry, critical alerts
- **Doctor's Assistant** — scheduling, communication, document management, pre-auth
- **Insurance & billing** — automated claims (ICD-10/CPT), pre-authorization, facility billing
- **DHA integration** — Nabidh (FHIR R4), Salama license verification
- **UAE Pass** — authentication provider, Emirates ID verification, emergency access
- **Facility Admin** — staff management, departments, scheduling, compliance
- **Preventive care** — AI risk profiling, screening calendar, wellness goals

---

## 13.4 Phase 4 — Intelligence & Scale (Ongoing)

- Platform analytics — clinical outcomes, operational KPIs, AI performance
- Doctor CME recommendations (AI-powered)
- Population health dashboards for DHA
- Additional languages: Urdu, Hindi, Tagalog, Malayalam
- Native mobile apps (React Native / Capacitor)
- HealthKit / Google Fit integration
- Advanced AI: predictive analytics, outbreak detection
- Marketplace: third-party health app integrations
- White-label capability for hospital groups

---

## Summary

| Phase | Roles | Key Features | Duration |
|---|---|---|---|
| **1 MVP** | Guest, Patient, Doctor, Admin | AI chat, appointments, records, prescriptions, auth | 8-10 wks |
| **2** | + Family Member | Virtual consult, AI transcription, payments, Arabic | 6-8 wks |
| **3** | + Nurse, Pharmacy, Lab, Facility | Full clinical workflows, DHA, UAE Pass, insurance | 8-12 wks |
| **4** | All | Analytics, native mobile, advanced AI, marketplace | Ongoing |

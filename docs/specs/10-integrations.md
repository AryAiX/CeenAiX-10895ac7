# 10. Integration Specifications

---

## 10.1 UAE Pass — National Digital Identity

- **Purpose**: Verify UAE resident identity (Emirates ID) for registration, onboarding, and emergency access
- **Protocol**: OAuth 2.0 / OpenID Connect
- **Integration**: Supabase Auth custom provider
- **Data received**: Emirates ID number, full name, nationality, date of birth
- **Usage**: Patient fast-track registration, mandatory provider verification, emergency profile lookup
- **Fallback**: Manual Emirates ID entry + document photo upload + AI OCR verification

## 10.2 DHA Health Information Exchange — Nabidh & Salama

### Nabidh (Health Information Exchange)
- **Protocol**: HL7 FHIR R4 RESTful API
- **Direction**: Bidirectional — CeenAiX sends encounter summaries, lab results, prescriptions; receives patient history
- **Trigger**: Automated after doctor approves consultation notes
- **Data scope**: Patient demographics, encounters, diagnoses (ICD-10), medications, lab results, immunizations
- **Implementation**: Edge Function triggered by database webhook on `consultation_notes.doctor_approved = true`

### Salama (DHA Licensing)
- **Protocol**: REST API (DHA-provided)
- **Direction**: Read-only
- **Purpose**: Verify healthcare provider licenses during onboarding; periodic re-verification
- **Implementation**: Edge Function during onboarding; result stored in `doctor_profiles.dha_license_verified`

## 10.3 AI Services — OpenAI

| Service | Model | Use Case |
|---|---|---|
| Conversational AI | GPT-4o | Health consultation chat, symptom assessment, pre-visit questionnaires |
| Clinical Decision Support | GPT-4o | Differential diagnosis, treatment recommendations, drug interaction checks |
| Document / Photo Analysis | GPT-4o Vision | Insurance card OCR, lab result photo reading, prescription analysis |
| Live Transcription | Whisper API | Real-time speech-to-text during consultations |
| SOAP Note Generation | GPT-4o | Auto-generate structured clinical notes from transcripts |
| Semantic Search | text-embedding-3-small | Search across medical records, articles, clinical guidelines |
| Risk Profiling | GPT-4o | Analyze patient history for preventive care recommendations |

**Architecture**:
- All AI calls proxied through Supabase Edge Functions — frontend never calls OpenAI directly
- Edge Functions inject patient context (with consent check) before sending to OpenAI
- Streaming responses via Server-Sent Events (SSE) for conversational AI
- Responses tagged as "AI-generated" with provenance metadata

**Data Privacy**: Zero data retention DPA with OpenAI. Patient-identifiable data pseudonymized before sending where feasible. All AI interactions logged for audit.

**Fallback**: Graceful degradation — "AI temporarily unavailable" with manual workflow alternatives.

## 10.4 Video Consultation — LiveKit

- **Protocol**: WebRTC via LiveKit SFU
- **Capabilities**: 1-to-1 video/audio, screen sharing, real-time audio → Whisper API for transcription, recording (with consent), adaptive bitrate
- **Deployment**: UAE region for low latency and data residency
- **Implementation**: Room tokens from Edge Function scoped to `appointment_id`; LiveKit React SDK on frontend; audio stream piped to Whisper via Edge Function
- **Fallback**: Auto-fallback to audio-only; then phone callback option

## 10.5 Payment Gateway — Stripe

- **Supported methods**: Credit/debit cards (Visa, Mastercard), Apple Pay, Google Pay
- **Integration points**: Appointment booking (consultation fee), pharmacy delivery, facility subscriptions
- **Implementation**: Stripe Customer on registration; Payment Intents via Edge Function; Stripe.js for client-side tokenization; webhooks for status updates
- **Compliance**: PCI DSS Level 1 (handled by Stripe); CeenAiX never stores raw card numbers

## 10.6 SMS & OTP — Twilio

- OTP for registration and login (integrated with Supabase Auth phone provider)
- Appointment reminders: 24h and 1h before scheduled time
- Critical lab value alerts: immediate SMS to ordering doctor
- Prescription ready notifications

## 10.7 Email — Resend

- Registration confirmation, email verification
- Appointment confirmation and reminders
- Lab result availability notification
- Monthly health summary report (PDF)
- Password reset, invoices and payment receipts
- Templates support Arabic and English with RTL layout

## 10.8 Push Notifications — Firebase Cloud Messaging

- Appointment reminders and status changes
- New lab results, medication reminders, new messages, critical alerts
- Service worker for PWA background notifications
- Device tokens in `user_devices` table
- User notification preferences in `user_profiles.notification_preferences` (JSONB)

## 10.9 Interoperability — HL7 FHIR

- **Standard**: HL7 FHIR R4
- **Resources**: Patient, Practitioner, Organization, Encounter, Condition, MedicationRequest, DiagnosticReport, Observation, Immunization, AllergyIntolerance, ServiceRequest, DocumentReference
- **Implementation**: Edge Functions for FHIR transformation; outbound on consultation completion; inbound during onboarding/referral
- **Future**: FHIR server endpoint for direct system-to-system queries (Phase 3+)

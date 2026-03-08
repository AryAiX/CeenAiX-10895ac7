# 8. Technical Architecture

---

## 8.1 System Architecture Overview

CeenAiX follows a three-tier architecture:

- **Presentation Tier** — Single-page application (SPA) served as static assets via CDN
- **Application Tier** — Supabase (managed Postgres, Auth, Edge Functions, Realtime, Storage) as backend-as-a-service, supplemented by dedicated AI microservices
- **Data Tier** — PostgreSQL (Supabase-managed) for relational data; Supabase Storage for files/media; vector store for AI embeddings

### High-Level Component Map

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  React SPA (Vite + TypeScript + Tailwind CSS)           │
│  Responsive Web — Desktop, Tablet, Mobile               │
│  PWA shell for installability and offline access         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────┐
│                 SUPABASE PLATFORM                        │
│                                                          │
│  ┌───────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │   Auth     │  │ PostgREST  │  │ Realtime (WS)      │  │
│  │  (GoTrue)  │  │ (REST API) │  │ Live subscriptions │  │
│  └───────────┘  └────────────┘  └────────────────────┘  │
│                                                          │
│  ┌───────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Storage   │  │   Edge     │  │   PostgreSQL       │  │
│  │ (S3-compat)│  │ Functions  │  │ (Primary Database) │  │
│  └───────────┘  └────────────┘  └────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               EXTERNAL SERVICES                          │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │ AI Services │ │ Video/RTC  │ │ UAE Gov APIs         │ │
│  │ (OpenAI /   │ │ (LiveKit   │ │ (UAE Pass,           │ │
│  │  Azure AI)  │ │  WebRTC)   │ │  DHA Nabidh/Salama) │ │
│  └────────────┘ └────────────┘ └──────────────────────┘ │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │ Payment    │ │ SMS / Email│ │ Push Notifications   │ │
│  │ (Stripe)   │ │ (Twilio /  │ │ (FCM / APNs)        │ │
│  │            │ │  Resend)   │ │                      │ │
│  └────────────┘ └────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 8.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | React 18 + TypeScript | Component model, ecosystem maturity, hiring pool |
| Build Tool | Vite 5 | Fast HMR, native ESM, optimized production builds |
| Styling | Tailwind CSS 3 | Utility-first, design-system friendly, small bundle |
| Routing | React Router 7 | Declarative routing, nested layouts, code splitting |
| State Management | React Context + Supabase Realtime | Minimal overhead; server state via Supabase subscriptions |
| Backend / BaaS | Supabase (self-hosted or cloud) | Postgres, Auth, Storage, Edge Functions, Realtime — all-in-one |
| Database | PostgreSQL 15+ | ACID compliance, JSONB, RLS, full-text search, extensions |
| Authentication | Supabase Auth (GoTrue) | Email/password, OTP (SMS), social login, UAE Pass (custom provider) |
| File Storage | Supabase Storage (S3-compatible) | Medical documents, imaging, insurance cards, profile photos |
| Serverless Functions | Supabase Edge Functions (Deno) | AI orchestration, webhook handlers, scheduled jobs, integrations |
| AI / LLM | OpenAI GPT-4o (primary) | Conversational AI, clinical decision support, document analysis |
| AI — Vision / OCR | OpenAI GPT-4o Vision | Insurance card reading, lab result photo analysis, document OCR |
| AI — Speech-to-Text | OpenAI Whisper API | Real-time consultation transcription |
| AI — Embeddings | OpenAI text-embedding-3-small | Semantic search over medical records, articles, guidelines |
| Video Consultation | LiveKit (open-source WebRTC SFU) | HD video/audio, screen share, recording, HIPAA-eligible |
| Payment Gateway | Stripe (UAE-supported) | Consultation fees, pharmacy payments, subscription billing |
| SMS / OTP | Twilio | OTP verification, appointment reminders, critical alerts |
| Email | Resend | Transactional emails, notifications, reports |
| Push Notifications | Firebase Cloud Messaging (FCM) | Mobile and web push notifications |
| Monitoring | Sentry + Supabase Dashboard | Error tracking, performance monitoring, database metrics |
| CI/CD | GitHub Actions | Automated testing, linting, deployment pipelines |
| Hosting | Vercel (frontend) + Supabase Cloud | Edge deployment for SPA; managed Supabase infrastructure |

---

## 8.3 Mobile Strategy

CeenAiX launches as a **Progressive Web App (PWA)**:

- Single codebase for all platforms (desktop, tablet, mobile)
- Faster time-to-market than native development
- Push notifications via service worker + FCM
- Camera access for document/photo uploads
- Installable via browser "Add to Home Screen"

**Future (Phase 3+):** React Native wrapper or Capacitor shell for App Store / Play Store distribution. Required for: background location (emergency services), NFC (Emirates ID tap), HealthKit/Google Fit integration.

---

## 8.4 Multi-Tenancy Model

Shared-database, row-level-isolation:

- All facilities share a single PostgreSQL database
- Each facility has a unique `facility_id`; all entity tables include a `facility_id` foreign key
- PostgreSQL **Row-Level Security (RLS)** policies enforce:
  - Facility admins see only their facility's data
  - Clinical staff see only patients within their facility (or with explicit cross-facility consent)
  - Patients see only their own data regardless of facility
  - Super Admins bypass facility scoping

---

## 8.5 Security Architecture

- **Authentication**: Supabase Auth with email/password + SMS OTP; UAE Pass integration for national identity verification
- **Authorization**: PostgreSQL RLS policies at the database level — no application-level bypass possible
- **Encryption**: TLS 1.3 in transit; AES-256 at rest (Supabase-managed)
- **API Security**: PostgREST with JWT validation; Edge Functions for additional business logic
- **Audit Trail**: Immutable `audit_logs` table with user_id, action, table_name, old_value, new_value, timestamp, IP address
- **Session Management**: Short-lived JWTs (1 hour) with refresh tokens; concurrent session limits per role
- **File Security**: Supabase Storage with signed URLs for medical documents; no public bucket access
- **AI Data Handling**: Patient data sent to AI APIs is ephemeral (not used for model training); enterprise DPA agreements

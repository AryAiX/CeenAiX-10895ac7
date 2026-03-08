# CeenAiX Development Checklist

> Living tracker for all development work. Items are **never deleted** — mark as `deprecated` with a reason in Notes.
>
> **Statuses**: `pending` | `in-progress` | `done` | `deprecated`
>
> **Initials**: TH = product lead, AI = agent

---

## 1. Foundation (FND)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| FND-01 | Supabase Auth providers (email + phone OTP) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Infrastructure | | |
| FND-02 | Database migrations — Phase 1 tables | done | 2026-02-28 | TH | `docs/agent/schema-reference.md` — all Phase 1 tables with correct columns | 2026-03-08 | 12 migration files in `supabase/migrations/` |
| FND-03 | RLS policies on all Phase 1 tables | done | 2026-02-28 | TH | `docs/agent/schema-reference.md` — RLS Pattern; security requirement | 2026-03-08 | Included in migration files |
| FND-04 | Supabase Storage buckets (avatars, documents, medical-files) | done | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Infrastructure | 2026-03-08 | Migration 000013; includes RLS policies per bucket |
| FND-05 | Shared TypeScript types in `src/types/` | done | 2026-02-28 | TH | `AGENTS.md` — Code Style; replace Bolt inline types with spec-compliant shared types | 2026-03-08 | `enums.ts`, `database.ts`, `index.ts` |
| FND-06 | Auth context (`src/lib/auth-context.tsx`) | pending | 2026-02-28 | TH | `AGENTS.md` — Auth; React Context for auth state, `onAuthStateChange` listener | | |
| FND-07 | Custom hooks pattern (`src/hooks/`) | done | 2026-02-28 | TH | `AGENTS.md` — Code Style; e.g. `useAppointments()`, `usePatientProfile()` | 2026-03-08 | `useQuery`, `useUserProfile`, `useAppointments`, `useNotifications` |
| FND-08 | Error boundaries around major page sections | done | 2026-02-28 | TH | `AGENTS.md` — Code Style; graceful failure isolation | 2026-03-08 | `src/components/ErrorBoundary.tsx` |
| FND-09 | Skeleton loaders for all data-fetching views | done | 2026-02-28 | TH | `AGENTS.md` — Code Style; replace spinners with skeleton loaders | 2026-03-08 | `src/components/Skeleton.tsx` — Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar |
| FND-10 | Vercel project setup + environment variables | done | 2026-02-28 | TH | `docs/specs/08-technical-architecture.md` — Hosting: Vercel + Supabase Cloud | 2026-03-08 | Vercel project linked to `aryaix/ceenaix`; GitHub Actions secrets configured for Vercel + Supabase |
| FND-11 | GitHub Actions CI/CD (lint + typecheck + build + deploy) | done | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Infrastructure; `docs/specs/08-technical-architecture.md` | 2026-03-08 | `.github/workflows/ci.yml` + `deploy.yml` |
| FND-12 | Initial Vercel deployment (hello-world level) | done | 2026-02-28 | TH | Validates full pipeline: push → CI → deploy; unblocks all future work | 2026-03-08 | Production deploy validated via GitHub Actions `deploy.yml` after correcting Vercel token and linked project/org IDs |

---

## 2. Auth (AUTH)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| AUTH-01 | Login page (`/auth/login`) — email/password + OTP | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Auth Pages | | Depends on FND-01, FND-06 |
| AUTH-02 | Registration wizard (`/auth/register`) — multi-step | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Auth Pages; `docs/specs/04-user-flows.md` Flow 6 | | |
| AUTH-03 | OTP verification page (`/auth/verify-otp`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Auth Pages | | |
| AUTH-04 | Forgot password flow (`/auth/forgot-password`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Auth Pages | | |
| AUTH-05 | Onboarding wizard (`/auth/onboarding`) — post-registration | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Auth Pages; role-adaptive, skippable | | |
| AUTH-06 | Route guards (patient / doctor / admin) | pending | 2026-02-28 | TH | `AGENTS.md` — Auth; redirect unauthenticated → `/auth/login`, wrong role → `/access-denied` | | Depends on FND-06 |
| AUTH-07 | Access denied page (`/access-denied`) | pending | 2026-02-28 | TH | `docs/agent/routes-reference.md` — System routes | | |

---

## 3. Patient Features (PAT)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| PAT-01 | Rewire PatientDashboard to live Supabase data | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently ui-only with mock data | | Depends on FND-02, FND-07 |
| PAT-02 | Patient AI chat (`/patient/ai-chat`) with context + Edge Function | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages; `docs/agent/ai-reference.md` | | Depends on AI-01, AI-04 |
| PAT-03 | Appointment booking flow (`/patient/appointments/book`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages; `docs/specs/04-user-flows.md` Flow 1 | | |
| PAT-04 | Appointment detail page (`/patient/appointments/:id`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages | | |
| PAT-05 | Rewire PatientAppointments to spec schema | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — queries wrong columns, wrong joins | | Depends on FND-02, FND-05 |
| PAT-06 | Rewire PatientRecords to medical_conditions / allergies / vaccinations | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently fully static | | Depends on FND-02 |
| PAT-07 | Lab results viewer (`/patient/lab-results`) + AI interpretation | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages; AI plain-language explanation | | Depends on FND-02, AI-01 |
| PAT-08 | Rewire PatientPrescriptions to normalized schema | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — flat vs prescriptions + prescription_items | | Depends on FND-02, FND-05 |
| PAT-09 | Rewire PatientMessages to conversations / messages tables | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently fully static | | Depends on FND-02 |
| PAT-10 | Patient notifications (`/patient/notifications`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages | | Depends on FND-02 |
| PAT-11 | Rewire PatientProfile to user_profiles + patient_profiles + patient_insurance | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently local state only | | Depends on FND-02, FND-05 |
| PAT-12 | Emergency profile page (`/patient/emergency-profile`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Patient Pages; `docs/specs/04-user-flows.md` Flow 13 | | |

---

## 4. Doctor Features (DOC)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| DOC-01 | Rewire DoctorDashboard to live Supabase data | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently all-zeros static | | Depends on FND-02, FND-07 |
| DOC-02 | Rewire DoctorPatients to live data (via appointments join) | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently static list | | Depends on FND-02 |
| DOC-03 | Patient detail page (`/doctor/patients/:id`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages; full health record view | | |
| DOC-04 | Rewire DoctorAppointments to spec schema | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently static list | | Depends on FND-02, FND-05 |
| DOC-05 | Appointment detail / consultation notes (`/doctor/appointments/:id`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages; SOAP notes | | |
| DOC-06 | Create prescription page (`/doctor/prescriptions/new`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages; prescriptions + prescription_items | | |
| DOC-07 | Rewire DoctorPrescriptions to live data | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently empty state | | Depends on FND-02 |
| DOC-08 | Lab order creation (`/doctor/lab-orders`, `/doctor/lab-orders/new`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages; lab_orders + lab_order_items | | |
| DOC-09 | Schedule / availability management (`/doctor/schedule`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages; doctor_availability, blocked_slots | | |
| DOC-10 | Rewire DoctorMessages to conversations / messages tables | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently empty state | | Depends on FND-02 |
| DOC-11 | Doctor notifications (`/doctor/notifications`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Doctor Pages | | Depends on FND-02 |
| DOC-12 | Rewire DoctorProfile to user_profiles + doctor_profiles | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — queries wrong `profiles` table | | Depends on FND-02, FND-05 |

---

## 5. Admin Features (ADM)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| ADM-01 | Admin dashboard (`/admin/dashboard`) | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Admin Pages; basic platform overview | | Depends on AUTH-06 |
| ADM-02 | User management (`/admin/users`) — CRUD | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Admin Pages; create/edit/suspend accounts | | |
| ADM-03 | Insurance plan management (`/admin/insurance`) — CRUD | pending | 2026-02-28 | TH | `docs/agent/mvp-scope.md` — Admin Pages | | |

---

## 6. AI Features (AI)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| AI-01 | `ai-chat` Edge Function (GPT-4o + SSE streaming) | pending | 2026-02-28 | TH | `docs/agent/ai-reference.md` — Conversational Health Chat | | |
| AI-02 | `ai-document-analyze` Edge Function (GPT-4o Vision) | pending | 2026-02-28 | TH | `docs/agent/ai-reference.md` — Document & Photo Analysis | | |
| AI-03 | `ai-embed` Edge Function (text-embedding-3-small) | pending | 2026-02-28 | TH | `docs/agent/ai-reference.md` — semantic search embeddings | | |
| AI-04 | Rewire AIChat page to use Edge Functions (replace local rules) | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently hardcoded keyword matching | | Depends on AI-01 |
| AI-05 | AI-powered lab result interpretation (patient-facing) | pending | 2026-02-28 | TH | `docs/agent/ai-reference.md` — Lab Result Interpretation; plain-language explanation | | Depends on AI-01, PAT-07 |

---

## 7. Public Pages (PUB)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| PUB-01 | Rewire FindDoctor to spec schema (doctor_profiles + user_profiles) | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — queries wrong `doctors` table | | Depends on FND-02 |
| PUB-02 | Rewire FindClinic for MVP (hardcode or simple facilities query) | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — queries Phase 3 `hospitals` table | | |
| PUB-03 | Wire Insurance page to `insurance_plans` table | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently static data | | Depends on FND-02 |
| PUB-04 | Wire HealthEducation page to `health_articles` table | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — currently static data | | Depends on FND-02 |
| PUB-05 | About page (`/about`) | pending | 2026-02-28 | TH | `docs/specs/14-route-map.md` — Public routes | | |
| PUB-06 | Remove non-MVP routes from router | pending | 2026-02-28 | TH | `docs/agent/bolt-code-audit.md` — `/pharmacy`, `/laboratories`, `/appointment-showcase` are not in MVP | | |

---

## 8. System (SYS)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| SYS-01 | 404 Not Found page | pending | 2026-02-28 | TH | `docs/specs/14-route-map.md` — System routes | | |
| SYS-02 | 500 Server Error page | pending | 2026-02-28 | TH | `docs/specs/14-route-map.md` — System routes | | |
| SYS-03 | Maintenance page | pending | 2026-02-28 | TH | `docs/specs/14-route-map.md` — System routes | | |
| SYS-04 | Access Denied page | pending | 2026-02-28 | TH | `docs/specs/14-route-map.md` — System routes; used by AUTH-06 route guards | | Same page as AUTH-07 |

---

## 9. Non-Functional (NFR)

| ID | Item | Status | Added | By | Justification | Completed | Notes |
|---|---|---|---|---|---|---|---|
| NFR-01 | Lighthouse CI in GitHub Actions (LCP target < 2s) | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — 11.1 Performance | | Depends on FND-11 |
| NFR-02 | Code splitting with React.lazy for page routes | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — Optimization strategies | | |
| NFR-03 | WebP images with lazy loading | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — Optimization strategies | | |
| NFR-04 | axe-core in CI pipeline for accessibility | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — 11.4 Accessibility; WCAG 2.1 AA | | Depends on FND-11 |
| NFR-05 | Keyboard navigation + focus indicators audit | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — 11.4 Accessibility | | |
| NFR-06 | Semantic HTML and ARIA audit | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — 11.4 Accessibility | | |
| NFR-07 | RLS coverage audit — verify all tables have policies | pending | 2026-02-28 | TH | `docs/agent/schema-reference.md` — RLS Pattern; security requirement | | After FND-03 |
| NFR-08 | Environment variable audit — no secrets in code | pending | 2026-02-28 | TH | `docs/specs/08-technical-architecture.md` — Security | | |
| NFR-09 | Sentry integration for error tracking | pending | 2026-02-28 | TH | `docs/specs/08-technical-architecture.md` — Monitoring: Sentry + Supabase Dashboard | | |
| NFR-10 | Scheduled job for guest AI session cleanup (30 days) | pending | 2026-02-28 | TH | `docs/specs/11-non-functional-requirements.md` — 11.6 Data Retention | | Depends on AI-01 |

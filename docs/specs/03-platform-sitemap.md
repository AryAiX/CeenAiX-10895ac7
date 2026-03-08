# 3. Platform Sitemap

The CeenAiX platform is organized into six primary zones, each serving a distinct user group. Public-facing zones are accessible without authentication; authenticated zones are gated by role-based access control (RBAC).

---

## 3.1 Public Zone (No Authentication Required)

| Section | Pages / Features |
|---|---|
| Home | Landing page, platform overview, value proposition, featured doctors, health articles |
| AI Health Agent | Conversational AI chat without login; document/photo upload. Prompts account creation for booking. |
| Find a Doctor | Search by specialty, location, language, availability, insurance accepted, rating |
| Find a Clinic / Hospital | Search and browse healthcare facilities with profiles, services, patient reviews |
| Insurance Plans | Browse insurance packages (read-only; no purchase without account) |
| Health Education | Articles, guides, and preventive care resources by specialty and topic |
| Emergency Access | Information page for emergency services — AI-assisted emergency health profile access via Emirates ID |
| About CeenAiX | Platform mission, team, DHA partnership, compliance credentials |
| Login / Register | Account creation flows for patients, healthcare providers, and facility admins |

## 3.2 Patient Zone (Authenticated)

| Section | Sub-sections |
|---|---|
| Dashboard | Health overview, health score, AI recommendations, upcoming appointments, notifications |
| AI Health Agent | Full conversation history, new consultation, document upload, pre-visit assessment |
| Appointments | Book appointment, upcoming, past, virtual consultation room |
| My Health Record | Medical history, diagnoses, medications, allergies, surgeries, vaccinations, documents |
| Lab Results & Imaging | Results inbox, AI-analyzed results, imaging reports |
| Prescriptions | Active prescriptions, history, pharmacy dispatch, refill requests |
| Preventive Care | Risk assessment, screening calendar, wellness goals, health tracking |
| Insurance | Active coverage, claims, insurance card, plan comparison |
| Family Management | Linked family members, dependent profiles, consent management |
| Emergency Profile | Emergency access card settings, linked emergency contacts |
| Messages | Secure messaging with healthcare providers |
| Profile & Settings | Personal profile, privacy, notification preferences, language settings |

## 3.3 Healthcare Provider Zone (Role-Specific Views)

| Role | Dashboard Sections |
|---|---|
| Doctor | Clinical overview, patient queue, appointments, patient profiles, consultation room (AI-assisted), prescriptions, lab orders, referrals, schedule management, analytics, messages, profile |
| Nurse | Shift overview, patient queue, triage, vital signs, medication records, lab tracking, care plans, shift notes, messages, profile |
| Doctor's Assistant | Appointment management, patient communications, document management, pre-authorization, billing support, referral coordination, profile |
| Pharmacy | Prescription inbox, dispensing workflow, inventory, delivery management, patient medication history, insurance claims, analytics, profile |
| Laboratory | Test order inbox, sample management, result entry, critical alerts, QC records, billing, analytics, profile |

## 3.4 Facility Admin Zone

| Section | Description |
|---|---|
| Admin Dashboard | Facility KPIs, staff activity, revenue summary, compliance status |
| Staff Management | Add/manage all clinical and administrative staff accounts |
| Departments & Services | Configure departments, specialties, and service catalogue |
| Schedule & Resources | Manage rooms, equipment, and shared scheduling resources |
| Billing & Finance | Fee schedules, payments, insurance configuration, invoicing |
| Analytics & Reports | Detailed operational and clinical reports |
| Compliance Center | DHA licensing, audit documentation, compliance tracker |
| Settings | Facility profile, notifications, integration settings |

## 3.5 Super Admin Zone (AryAiX Internal)

| Section | Description |
|---|---|
| Platform Overview | Global KPIs, active users, system health, AI performance metrics |
| User Management | All user accounts, role management, suspensions, audit trails |
| Provider Onboarding | Onboarding pipeline, approvals, DHA verification, configuration |
| Insurance Management | Insurance company packages, plan details, pricing, availability |
| AI Management | Model performance, flagged conversations, training feedback, clinical validation logs |
| Content Management | Health articles, guides, notifications, multi-language content |
| Finance & Billing | Platform-wide revenue, subscriptions, invoicing, financial reports |
| Security & Compliance | Audit logs, security alerts, DHA compliance dashboard, data governance |
| System Configuration | Feature flags, integrations, API management, environment settings |

## 3.6 Authentication Zone

| Page | Description |
|---|---|
| Login | Email/password, mobile OTP, UAE Pass (Phase 3) |
| Register | Multi-step: choose method → verify OTP → select role → basic profile → optional uploads → dashboard |
| Forgot Password | Email entry → reset link → new password form |
| OTP Verification | Shared OTP input screen for registration, login, and password reset |
| Onboarding Wizard (Patient) | Complete profile, upload Emirates ID, upload insurance card, set notification preferences. Skippable. |
| Onboarding Wizard (Doctor) | Professional setup: credentials, DHA license upload, availability, bio. Submits for admin review. |

## 3.7 Error & System Pages

| Page | Description |
|---|---|
| 404 Not Found | Friendly error page with search bar and links to common pages |
| 500 Server Error | Error page with 'Try Again' button and link to status page |
| Maintenance | Scheduled maintenance page with estimated return time; auto-refreshes |
| Access Denied | Shown when user accesses a page outside their role's permissions |

## 3.8 Shared Authenticated Pages

| Page | Description |
|---|---|
| Notification Center | Chronological list of all notifications; filter by type; mark as read; tap to navigate |
| Virtual Consultation Room | WebRTC video/audio interface (Phase 2); camera/mic controls, screen share, chat sidebar, AI transcription panel |

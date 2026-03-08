# 14. Complete Route Map

> Implementation status reflects the Bolt UI prototype as of the latest code review.
> Status: **live** (Supabase queries) | **ui-only** (static/mock) | **not-started** | **bolt-extra** (not in spec)

---

## Public

| Route | Page | Status |
|---|---|---|
| `/` | Home (landing page) | ui-only |
| `/ai-chat` | AI Health Agent (guest mode) | ui-only |
| `/find-doctor` | Find a Doctor | live |
| `/find-clinic` | Find a Clinic / Hospital | live |
| `/insurance` | Insurance Plans | ui-only |
| `/health-education` | Health Education | ui-only |
| `/emergency-access` | Emergency Access portal (Phase 3) | not-started |
| `/about` | About CeenAiX | not-started |
| `/pharmacy` | Pharmacy (browse) | bolt-extra |
| `/laboratories` | Laboratories (browse) | bolt-extra |
| `/appointment-showcase` | Design Showcase (demo) | bolt-extra |

## Authentication

| Route | Page | Status |
|---|---|---|
| `/auth/login` | Login | not-started |
| `/auth/register` | Register (multi-step) | not-started |
| `/auth/forgot-password` | Forgot Password | not-started |
| `/auth/verify-otp` | OTP Verification | not-started |
| `/auth/onboarding` | Onboarding Wizard (role-adaptive) | not-started |

## Patient

| Route | Page | Status |
|---|---|---|
| `/patient/dashboard` | Dashboard | ui-only |
| `/patient/ai-chat` | AI Health Agent (with patient context) | not-started |
| `/patient/appointments` | Appointments list | live |
| `/patient/appointments/book` | Appointment Booking | not-started |
| `/patient/appointments/:id` | Appointment Detail | not-started |
| `/patient/records` | Medical Records | ui-only |
| `/patient/records/conditions` | Conditions & Diagnoses | not-started |
| `/patient/records/allergies` | Allergies | not-started |
| `/patient/records/medications` | Active Medications | not-started |
| `/patient/records/vaccinations` | Vaccination History | not-started |
| `/patient/lab-results` | Lab Results & Imaging | not-started |
| `/patient/lab-results/:id` | Lab Result Detail | not-started |
| `/patient/prescriptions` | Prescriptions | live |
| `/patient/preventive-care` | Preventive Care (Phase 3) | not-started |
| `/patient/insurance` | Insurance & Coverage | not-started |
| `/patient/insurance/claims` | Claims Tracking | not-started |
| `/patient/family` | Family Management (Phase 2) | not-started |
| `/patient/emergency-profile` | Emergency Profile Settings | not-started |
| `/patient/messages` | Messages | ui-only |
| `/patient/messages/:id` | Conversation Detail | not-started |
| `/patient/notifications` | Notification Center | not-started |
| `/patient/profile` | Profile & Settings | ui-only |
| `/patient/privacy` | Privacy Controls | not-started |

## Doctor

| Route | Page | Status |
|---|---|---|
| `/doctor/dashboard` | Dashboard | ui-only |
| `/doctor/patients` | Patient List | ui-only |
| `/doctor/patients/:id` | Patient Profile & Records | not-started |
| `/doctor/appointments` | Appointments | ui-only |
| `/doctor/appointments/:id` | Appointment Detail / Consultation | not-started |
| `/doctor/consultation/:id` | Active Consultation (AI-assisted) | not-started |
| `/doctor/prescriptions` | Prescriptions | ui-only |
| `/doctor/prescriptions/new` | Create Prescription | not-started |
| `/doctor/lab-orders` | Lab Orders | not-started |
| `/doctor/lab-orders/new` | Create Lab Order | not-started |
| `/doctor/referrals` | Referrals (Phase 2) | not-started |
| `/doctor/schedule` | Schedule & Availability | not-started |
| `/doctor/messages` | Messages | ui-only |
| `/doctor/messages/:id` | Conversation Detail | not-started |
| `/doctor/notifications` | Notification Center | not-started |
| `/doctor/analytics` | Clinical Analytics (Phase 4) | not-started |
| `/doctor/profile` | Professional Profile | live |

## Nurse (Phase 3)

| Route | Page | Status |
|---|---|---|
| `/nurse/dashboard` | Shift Dashboard | not-started |
| `/nurse/queue` | Patient Queue | not-started |
| `/nurse/patients/:id/triage` | Triage & Vitals | not-started |
| `/nurse/medications` | Medication Administration | not-started |
| `/nurse/shift-notes` | Shift Notes | not-started |
| `/nurse/messages` | Messages | not-started |
| `/nurse/profile` | Profile | not-started |

## Pharmacy (Phase 3)

| Route | Page | Status |
|---|---|---|
| `/pharmacy/dashboard` | Dashboard | not-started |
| `/pharmacy/prescriptions` | Prescription Inbox | not-started |
| `/pharmacy/prescriptions/:id` | Dispensing Workflow | not-started |
| `/pharmacy/inventory` | Inventory Management | not-started |
| `/pharmacy/deliveries` | Delivery Tracking | not-started |
| `/pharmacy/analytics` | Analytics | not-started |
| `/pharmacy/profile` | Profile | not-started |

## Laboratory (Phase 3)

| Route | Page | Status |
|---|---|---|
| `/lab/dashboard` | Dashboard | not-started |
| `/lab/orders` | Test Order Inbox | not-started |
| `/lab/orders/:id` | Order Detail / Result Entry | not-started |
| `/lab/samples` | Sample Tracking | not-started |
| `/lab/quality-control` | QC Records | not-started |
| `/lab/analytics` | Analytics | not-started |
| `/lab/profile` | Profile | not-started |

## Facility Admin (Phase 3)

| Route | Page | Status |
|---|---|---|
| `/facility/dashboard` | Admin Dashboard | not-started |
| `/facility/staff` | Staff Management | not-started |
| `/facility/departments` | Departments & Services | not-started |
| `/facility/schedule` | Schedule & Resources | not-started |
| `/facility/billing` | Billing & Finance | not-started |
| `/facility/analytics` | Analytics & Reports | not-started |
| `/facility/compliance` | Compliance Center | not-started |
| `/facility/settings` | Facility Settings | not-started |

## Super Admin

| Route | Page | Status |
|---|---|---|
| `/admin/dashboard` | Platform Overview | not-started |
| `/admin/users` | User Management | not-started |
| `/admin/providers` | Provider Onboarding | not-started |
| `/admin/facilities` | Facility Management | not-started |
| `/admin/insurance` | Insurance Management | not-started |
| `/admin/ai` | AI Management (Phase 4) | not-started |
| `/admin/content` | Content Management | not-started |
| `/admin/finance` | Finance & Billing | not-started |
| `/admin/security` | Security & Audit Logs | not-started |
| `/admin/settings` | System Configuration | not-started |

## System

| Route | Page | Status |
|---|---|---|
| `/404` | Not Found | not-started |
| `/500` | Server Error | not-started |
| `/maintenance` | Maintenance | not-started |
| `/access-denied` | Access Denied | not-started |

## Shared (all authenticated roles)

| Route | Page | Status |
|---|---|---|
| `/consultation/:id` | Virtual Consultation Room (Phase 2) | not-started |
| `/notifications` | Notification Center (redirects to role-specific path) | not-started |

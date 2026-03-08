# 14. Complete Route Map

---

## Public

| Route | Page |
|---|---|
| `/` | Home (landing page) |
| `/ai-chat` | AI Health Agent (guest mode) |
| `/find-doctor` | Find a Doctor |
| `/find-clinic` | Find a Clinic / Hospital |
| `/insurance` | Insurance Plans |
| `/health-education` | Health Education |
| `/emergency-access` | Emergency Access portal (Phase 3) |
| `/about` | About CeenAiX |

## Authentication

| Route | Page |
|---|---|
| `/auth/login` | Login |
| `/auth/register` | Register (multi-step) |
| `/auth/forgot-password` | Forgot Password |
| `/auth/verify-otp` | OTP Verification |
| `/auth/onboarding` | Onboarding Wizard (role-adaptive) |

## Patient

| Route | Page |
|---|---|
| `/patient/dashboard` | Dashboard |
| `/patient/ai-chat` | AI Health Agent (with patient context) |
| `/patient/appointments` | Appointments list |
| `/patient/appointments/book` | Appointment Booking |
| `/patient/appointments/:id` | Appointment Detail |
| `/patient/records` | Medical Records |
| `/patient/records/conditions` | Conditions & Diagnoses |
| `/patient/records/allergies` | Allergies |
| `/patient/records/medications` | Active Medications |
| `/patient/records/vaccinations` | Vaccination History |
| `/patient/lab-results` | Lab Results & Imaging |
| `/patient/lab-results/:id` | Lab Result Detail |
| `/patient/prescriptions` | Prescriptions |
| `/patient/preventive-care` | Preventive Care (Phase 3) |
| `/patient/insurance` | Insurance & Coverage |
| `/patient/insurance/claims` | Claims Tracking |
| `/patient/family` | Family Management (Phase 2) |
| `/patient/emergency-profile` | Emergency Profile Settings |
| `/patient/messages` | Messages |
| `/patient/messages/:id` | Conversation Detail |
| `/patient/notifications` | Notification Center |
| `/patient/profile` | Profile & Settings |
| `/patient/privacy` | Privacy Controls |

## Doctor

| Route | Page |
|---|---|
| `/doctor/dashboard` | Dashboard |
| `/doctor/patients` | Patient List |
| `/doctor/patients/:id` | Patient Profile & Records |
| `/doctor/appointments` | Appointments |
| `/doctor/appointments/:id` | Appointment Detail / Consultation |
| `/doctor/consultation/:id` | Active Consultation (AI-assisted) |
| `/doctor/prescriptions` | Prescriptions |
| `/doctor/prescriptions/new` | Create Prescription |
| `/doctor/lab-orders` | Lab Orders |
| `/doctor/lab-orders/new` | Create Lab Order |
| `/doctor/referrals` | Referrals (Phase 2) |
| `/doctor/schedule` | Schedule & Availability |
| `/doctor/messages` | Messages |
| `/doctor/messages/:id` | Conversation Detail |
| `/doctor/notifications` | Notification Center |
| `/doctor/analytics` | Clinical Analytics (Phase 4) |
| `/doctor/profile` | Professional Profile |

## Nurse (Phase 3)

| Route | Page |
|---|---|
| `/nurse/dashboard` | Shift Dashboard |
| `/nurse/queue` | Patient Queue |
| `/nurse/patients/:id/triage` | Triage & Vitals |
| `/nurse/medications` | Medication Administration |
| `/nurse/shift-notes` | Shift Notes |
| `/nurse/messages` | Messages |
| `/nurse/profile` | Profile |

## Pharmacy (Phase 3)

| Route | Page |
|---|---|
| `/pharmacy/dashboard` | Dashboard |
| `/pharmacy/prescriptions` | Prescription Inbox |
| `/pharmacy/prescriptions/:id` | Dispensing Workflow |
| `/pharmacy/inventory` | Inventory Management |
| `/pharmacy/deliveries` | Delivery Tracking |
| `/pharmacy/analytics` | Analytics |
| `/pharmacy/profile` | Profile |

## Laboratory (Phase 3)

| Route | Page |
|---|---|
| `/lab/dashboard` | Dashboard |
| `/lab/orders` | Test Order Inbox |
| `/lab/orders/:id` | Order Detail / Result Entry |
| `/lab/samples` | Sample Tracking |
| `/lab/quality-control` | QC Records |
| `/lab/analytics` | Analytics |
| `/lab/profile` | Profile |

## Facility Admin (Phase 3)

| Route | Page |
|---|---|
| `/facility/dashboard` | Admin Dashboard |
| `/facility/staff` | Staff Management |
| `/facility/departments` | Departments & Services |
| `/facility/schedule` | Schedule & Resources |
| `/facility/billing` | Billing & Finance |
| `/facility/analytics` | Analytics & Reports |
| `/facility/compliance` | Compliance Center |
| `/facility/settings` | Facility Settings |

## Super Admin

| Route | Page |
|---|---|
| `/admin/dashboard` | Platform Overview |
| `/admin/users` | User Management |
| `/admin/providers` | Provider Onboarding |
| `/admin/facilities` | Facility Management |
| `/admin/insurance` | Insurance Management |
| `/admin/ai` | AI Management (Phase 4) |
| `/admin/content` | Content Management |
| `/admin/finance` | Finance & Billing |
| `/admin/security` | Security & Audit Logs |
| `/admin/settings` | System Configuration |

## System

| Route | Page |
|---|---|
| `/404` | Not Found |
| `/500` | Server Error |
| `/maintenance` | Maintenance |
| `/access-denied` | Access Denied |

## Shared (all authenticated roles)

| Route | Page |
|---|---|
| `/consultation/:id` | Virtual Consultation Room (Phase 2) |
| `/notifications` | Notification Center (redirects to role-specific path) |

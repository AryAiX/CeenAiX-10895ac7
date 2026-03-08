# Routes Quick Reference

> MVP routes only. Full route map in `docs/specs/14-route-map.md`.

## Public (no auth)

| Route | Component | Notes |
|---|---|---|
| `/` | Home | Landing page |
| `/ai-chat` | AIChat | Guest AI chat; prompt registration on booking |
| `/find-doctor` | FindDoctor | Supabase query: `doctor_profiles` + `user_profiles` |
| `/find-clinic` | FindClinic | Supabase query: `facilities` (or hardcoded in MVP) |
| `/insurance` | Insurance | Supabase query: `insurance_plans` |
| `/health-education` | HealthEducation | Supabase query: `health_articles` |

## Auth

| Route | Component | Notes |
|---|---|---|
| `/auth/login` | Login | Email/password + OTP; redirect by role |
| `/auth/register` | Register | Multi-step wizard |
| `/auth/forgot-password` | ForgotPassword | Email reset link |
| `/auth/verify-otp` | VerifyOTP | Shared OTP screen |
| `/auth/onboarding` | Onboarding | Role-adaptive; skippable |

## Patient (auth required, role=patient)

| Route | Component | Key Data |
|---|---|---|
| `/patient/dashboard` | PatientDashboard | appointments, prescriptions, notifications |
| `/patient/ai-chat` | PatientAIChat | ai_chat_sessions, ai_chat_messages |
| `/patient/appointments` | PatientAppointments | appointments (patient_id = me) |
| `/patient/appointments/book` | BookAppointment | doctor_availability, blocked_slots |
| `/patient/appointments/:id` | AppointmentDetail | single appointment + consultation_notes |
| `/patient/records` | PatientRecords | medical_conditions, allergies, vaccinations |
| `/patient/lab-results` | PatientLabResults | lab_orders + lab_order_items (patient_id = me) |
| `/patient/prescriptions` | PatientPrescriptions | prescriptions + prescription_items |
| `/patient/messages` | PatientMessages | conversations, messages |
| `/patient/notifications` | NotificationCenter | notifications (user_id = me) |
| `/patient/profile` | PatientProfile | user_profiles, patient_profiles, patient_insurance |

## Doctor (auth required, role=doctor)

| Route | Component | Key Data |
|---|---|---|
| `/doctor/dashboard` | DoctorDashboard | today's appointments, unread messages |
| `/doctor/patients` | DoctorPatients | patients via appointments |
| `/doctor/patients/:id` | PatientDetail | patient's full health record |
| `/doctor/appointments` | DoctorAppointments | appointments (doctor_id = me) |
| `/doctor/appointments/:id` | DoctorAppointmentDetail | appointment + notes |
| `/doctor/prescriptions` | DoctorPrescriptions | prescriptions (doctor_id = me) |
| `/doctor/prescriptions/new` | CreatePrescription | creates prescription + items |
| `/doctor/lab-orders` | DoctorLabOrders | lab_orders (doctor_id = me) |
| `/doctor/lab-orders/new` | CreateLabOrder | creates lab_order + items |
| `/doctor/schedule` | DoctorSchedule | doctor_availability, blocked_slots |
| `/doctor/messages` | DoctorMessages | conversations, messages |
| `/doctor/notifications` | NotificationCenter | notifications (user_id = me) |
| `/doctor/profile` | DoctorProfile | user_profiles, doctor_profiles |

## Admin (auth required, role=super_admin)

| Route | Component |
|---|---|
| `/admin/dashboard` | AdminDashboard |
| `/admin/users` | UserManagement |
| `/admin/insurance` | InsuranceManagement |

## System

| Route | Component |
|---|---|
| `/404` | NotFound |
| `/access-denied` | AccessDenied |

## Route Guards

All `/patient/*` routes require `role === 'patient'`.
All `/doctor/*` routes require `role === 'doctor'`.
All `/admin/*` routes require `role === 'super_admin'`.
Unauthorized access redirects to `/access-denied`.
Unauthenticated access redirects to `/auth/login`.

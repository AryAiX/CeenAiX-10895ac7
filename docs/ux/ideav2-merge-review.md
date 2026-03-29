# `ideav2` UX Merge Review

Date: 2026-03-28
Source branch: `parniay90/CeenAiX-2v` `ideav2`
Target branch: `UX-1`

## Decision Rule

Apply the source branch using these rules:

1. If the source change is for a static page that already exists in this repo, replace our current page with the UX version.
2. If the source change is for a functional page that already exists in this repo, carry over styles, layout, assets, and interaction polish only. Do not replace our routing, data access, auth, Supabase wiring, or business logic.
3. If the source branch adds functionality that does not exist in this repo, document it for product review instead of merging it automatically.

## Recommendation

Do **not** merge `ideav2` directly.

The branch is not a UX-only layer. It contains:

- its own router in `src/Router.tsx`
- its own auth, language, theme, and profile contexts in `src/contexts/`
- its own Supabase functions in `supabase/functions/`
- its own migrations in `supabase/migrations/`
- multiple new product surfaces and portals beyond the current MVP

The safest path is a **selective UX transfer into this repo**, using the categorization below.

## A. Replace Current Static Pages

These are the best candidates for full replacement because they are primarily static marketing or informational surfaces.

| Current Repo Target | Source in `ideav2` | Recommendation | Notes |
|---|---|---|---|
| `src/pages/public/Home.tsx` | `src/pages/LandingPage.tsx` | replace | Strongest direct fit. This is the clearest static UX upgrade candidate. |
| Shared public branding assets | `public/ChatGPT_Image_Feb_27,_2026,_11_29_01_AM*.png`, `public/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM*.png`, selected static media | replace selectively | Safe to copy brand/media assets as long as we clean duplicates and only keep assets actually referenced by the final UI. |
| Shared static footer / marketing chrome | `src/components/Footer.tsx`, selected navbar presentation patterns | replace selectively | Use only where they support current routes and MVP navigation. |

## B. Existing Functional Pages: Style Only

These already exist in our repo as live or partially wired product surfaces. Pull over visual design only.

| Current Repo Target | Source in `ideav2` | Recommendation | Functional Drift Notes |
|---|---|---|---|
| `src/pages/public/FindDoctor.tsx` | `src/pages/DoctorsPage.tsx` | style only | Source page uses static doctor seed data instead of our current doctor search flow. |
| `src/pages/public/FindClinic.tsx` | `src/pages/HospitalsPage.tsx` | style only | Treat as presentation reference only. |
| `src/pages/public/AIChat.tsx` | `src/components/AIChat.tsx` | style only | Keep our current routing and AI integration path. |
| `src/pages/auth/Login.tsx` | `src/pages/LoginPage.tsx` | style only | Keep our actual auth flow and route handling. |
| `src/pages/patient/Dashboard.tsx` | `src/pages/PatientDashboard.tsx` | style only | Source page mixes heavy static/mock portal behavior with some Supabase reads. |
| `src/pages/patient/Appointments.tsx` | `src/components/MyAppointments.tsx` | style only | Keep canonical appointment queries and intake status behavior from this repo. |
| `src/pages/patient/BookAppointment.tsx` | `src/components/AppointmentScheduler.tsx`, `src/components/EnhancedAppointmentScheduler.tsx` | style only | Keep our real scheduling logic against availability, blocked slots, and appointments. |
| `src/pages/patient/Prescriptions.tsx` | `src/pages/PrescriptionsPage.tsx` | style only | Keep our normalized prescription schema and existing data flow. |
| `src/pages/patient/Messages.tsx` | `src/pages/MessagesPage.tsx` | style only | Keep our route structure and future conversations/messages wiring plan. |
| `src/pages/patient/Profile.tsx` | `src/pages/Settings.tsx` | style only | Use layout ideas only; source introduces broader settings behavior. |
| `src/pages/doctor/Dashboard.tsx` | `src/pages/DoctorDashboard.tsx` | style only | Source dashboard is largely mock-driven and includes extra doctor AI sections. |
| `src/pages/doctor/Appointments.tsx` | appointment cards/layout patterns across dashboard components | style only | Keep our canonical appointment and pre-visit summary behavior. |
| `src/pages/doctor/Messages.tsx` | `src/pages/MessagesPage.tsx` | style only | Reuse visual shell only. |
| `src/pages/doctor/Profile.tsx` | `src/pages/DoctorSettings.tsx` | style only | Source page assumes extra settings/profile behavior not in current MVP. |
| `src/pages/public/HealthEducation.tsx` | `src/pages/NewsPage.tsx` | style only | Closest informational match, but content model is not 1:1. |

## C. New Functionality: Document Only

These should **not** be merged automatically. They introduce product scope, schema, routing, or backend changes not present in the current repo.

| Source Area | What It Adds | Why It Is Document-Only |
|---|---|---|
| `src/Router.tsx` | Custom in-memory routing/navigation system | Conflicts with our real React Router setup in `src/lib/router.tsx`. |
| `src/contexts/LanguageContext.tsx` | Basic Arabic toggle and RTL switch | Useful as inspiration, but incomplete for production i18n; does not provide a translation system. |
| `src/contexts/AuthContext.tsx`, `src/contexts/UserProfileContext.tsx`, `src/contexts/ThemeContext.tsx` | Alternate app state model | Conflicts with our existing auth and profile architecture. |
| `src/pages/AdminPortal.tsx`, `src/pages/SuperAdmin*` | Admin and super-admin portals | New functionality not yet implemented in this repo. |
| `src/pages/PharmacyAdmin*`, `src/pages/LaboratoryAdmin*` | Pharmacy and lab admin portals | New non-MVP or later-phase functionality. |
| `src/pages/DoctorRefillApproval.tsx`, `src/pages/PaymentSettings.tsx` | Refill approval and payment settings | New product behavior and data expectations. |
| `src/pages/EnhancedRadiologyPage.tsx`, `src/pages/RadiologyPage.tsx` | Radiology experience | New product surface and supporting schema. |
| `src/components/DoctorAIAssistant.tsx`, `supabase/functions/doctor-ai-*` | Doctor-side AI assistant, analysis, transcription | New AI functionality and new backend deployables. |
| `src/components/EmergencyAIChat.tsx`, `src/components/EmergencyButton.tsx`, `supabase/functions/emergency-ai` | Emergency AI workflow | New product behavior not in the current MVP scope. |
| `src/components/Family*`, family-member migrations | Family member management | New feature set and schema additions. |
| `src/pages/InsurancePage.tsx` | Live insurance providers and claims behavior | Goes beyond our current static insurance page and assumes new tables/flows. |
| `src/pages/FindLabsPage.tsx`, `src/pages/LabTestsPage.tsx`, `src/pages/PharmaciesPage.tsx` | Additional discovery/ordering flows | Not current MVP routing in this repo. |
| `supabase/migrations/*` in source repo | New schema for claims, reminders, radiology, calls, settings, admin, family, etc. | These are functional database changes, not UX-only updates. |

## D. Extra Cleanup Notes From Source Repo

These items should not be copied blindly even if we reuse the associated UX:

- duplicated logo/image files in `public/`
- placeholder medical images with trivial file contents
- custom contexts and services that bypass this repo's current architecture
- page-level mock data embedded directly inside portal screens

## Arabic Enablement Guidance

The source repo proves that `lang` and `dir` toggling can be added quickly, but it is not a complete Arabic implementation.

For this repo, Arabic should be implemented as:

1. a proper localization layer on top of the current router/auth structure
2. RTL-aware layout handling across shared navigation and page shells
3. translation resources for shared UI copy
4. per-page review for truncation, spacing, icon mirroring, and mixed-language content

Do not import the external language context as-is without adapting it to the current app architecture.

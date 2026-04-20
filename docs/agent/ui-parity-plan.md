# UI Parity Pass (UX-4-6-3)

> Persistent record of the plan to bring the canonical CeenAiX UI to a
> unified, refreshed visual treatment while preserving every piece of
> existing functionality (Supabase wiring, auth, hooks, types, i18n,
> routing, realtime, tests). The refreshed treatment is informed by a
> design reference snapshot kept on a local, git-ignored path; the
> output of this pass is 100% native CeenAiX code under our standard
> conventions.

## Reference sources

| Path | Role |
| --- | --- |
| `UX-4-6-3` (this repo) | Canonical app. Supabase + auth + i18n + hooks + router live here. Ultimate source of truth. |
| `.reference/CeenAiX-final-main-today/CeenAiX-final-main/` (git-ignored) | Local-only design reference snapshot used to eyeball visual tokens during the pass. **Never imported**, never merged, never referenced from source code. |
| `reference/bolt-final-main-2026-04-19` (git orphan branch) | Git-internal archival copy of the reference snapshot for reproducibility; not used by any build. |

The output of this pass never mentions the reference source in code,
filenames, routes, or commit messages. Pages added in tier 6/7 are
first-class canonical pages under `src/pages/<role>/` with named exports,
i18n keys, and our standard `PortalShell` wrapper.

## Ground rules (apply to every file)

- Port **only** these visual tokens:
  - Color system, radii, shadows, typography, spacing
  - Card / chip / badge / input / button treatments
  - Icon set (`lucide-react`) and sizing
  - Transitions and animations
  - Empty-state illustrations and their placement
- Never remove an existing feature to simplify a layout. When our app
  is richer than the reference (e.g., doctor portal's Today stats block,
  Supabase-wired allergy-alert banner, DHA-specific i18n, real account
  menu with email, language switcher with dense variant), **keep it**
  and restyle it to fit the refreshed treatment.
- Never port:
  - Data fetching or Supabase client calls from the reference snapshot
  - Reference-snapshot inline mock data or ad-hoc tables
    (`doctors`, `hospitals`, `profiles`, etc. — we use the canonical
    schema)
  - Reference-snapshot routing logic, auth context, or i18n strings
  - Sidebar / topnav wiring (we use `PortalShell` + our hooks)
  - Phase 2 / Phase 3 features outside `docs/agent/mvp-scope.md`
- Keep:
  - All hooks under `src/hooks/` (`usePatientDashboard`, `useDoctorDashboard`,
    `use-doctor-portal-chrome`, `useAuth`, etc.)
  - Shared types under `src/types/`
  - Routes in `src/lib/router.tsx`
  - `PortalShell`, `Layout`, `ErrorBoundary`, `Skeleton`, i18n keys
  - RTL / Arabic support where it exists
  - Existing tests in `*.test.tsx`
- Tooling contract after each edit:
  - `npm run typecheck` and `npm run lint` stay green
  - Visual verification via the screenshot workflow below (canonical on
    `http://127.0.0.1:5173/`, reference on `http://127.0.0.1:5174/`)
  - `git diff` on `src/hooks/**`, `src/lib/supabase.ts`,
    `src/lib/auth-context.tsx`, `src/lib/router.tsx`, `src/types/**` is
    empty for the port commit (safety rail — no functional drift)
  - Commit per logical block on `UX-4-6-3`

## Screenshot verification workflow

Every UIP-* row is backed by real renders of the canonical app before
and after the port, alongside a render of the design reference snapshot
that we eyeball while porting. The reference render never ships; only
the `before.png` and `after.png` pair proves the port.

### Processes

Run two Vite dev servers in parallel:

| Role | Port | Source |
| --- | --- | --- |
| Canonical CeenAiX (our app, `UX-4-6-3`) | 5173 | this repo |
| Local design reference                   | 5174 | `.reference/CeenAiX-final-main-today/CeenAiX-final-main/` (git-ignored) |

Helper scripts (already in repo):

```bash
npm run ui-parity:up       # start both servers (5173 + 5174)
npm run ui-parity:status
npm run ui-parity:down
```

Under the hood these call `scripts/ui-parity-servers.sh`, which writes
pids and logs to `.ui-parity/` (git-ignored).

### Capture

```bash
# 1. One-time per page, BEFORE porting anything.
npm run ui-parity:before

# 2. Restyle the page on UX-4-6-3 following ground rules above.
# 3. Re-capture AFTER porting.
npm run ui-parity:after

# Scope when iterating:
node scripts/ui-parity-capture.mjs --phase=after --route=patient-dashboard --viewport=desktop
```

Routes and viewports live in `scripts/ui-parity-routes.json` and can be
extended. The capture uses Playwright lazily-installed into
`.ui-parity/playwright-cache/` (git-ignored, no new repo dep).

### Output tree

```
docs/ui-parity/<route-id>/<viewport>/
  before.png     canonical, pre-port  (baseline)
  reference.png  design reference     (eyeballed while porting; not shipped)
  after.png      canonical, post-port (what we shipped)
```

Viewports captured: `desktop` (1440×900), `tablet` (1024×1366),
`mobile` (390×844). PNGs are git-ignored (see `.gitignore`); only the
directory structure and `README.md` are committed.

### Acceptance criteria per UIP-* row

A row in `CHECKLIST.md` section 17 may move to `done` **only when all**:

1. `before.png` and `after.png` are present for every applicable
   viewport. `reference.png` is optional and local-only.
2. `after.png` presents a refreshed, unified visual treatment that
   preserves every feature visible in `before.png`. No feature is
   hidden or removed for the sake of a cleaner layout.
3. `git diff` for the port commit is empty under `src/hooks/`,
   `src/lib/supabase.ts`, `src/lib/auth-context.tsx`,
   `src/lib/router.tsx`, and `src/types/` for tiers 1–5 (safety rail —
   proves we only restyled and did not drift functionality). Tiers 6–7
   may add new routes; those additions are narrowly scoped and called
   out in the commit message.
4. `npm run typecheck` and `npm run lint` pass.
5. The commit message is scoped to the tier, e.g.
   `feat(ui-parity): global chrome tokens + sidebar/topnav polish`.

### Order of operations for each tier

1. `npm run ui-parity:up` (idempotent).
2. `npm run ui-parity:before` once per tier (or per scoped route during
   iteration: `--route=<id>`).
3. Port styling per ground rules (Tailwind classes, iconography,
   `ceenai-*` utility additions if needed) across the whole tier.
4. `npm run ui-parity:after` to regenerate deltas for the tier.
5. Open `docs/ui-parity/<id>/<viewport>/` and compare
   `before.png` ↔ `after.png` (optionally against `reference.png`).
   Iterate until the refreshed treatment is consistent across the tier.
6. `npm run typecheck && npm run lint`.
7. Confirm `git diff` covers only styling / view files (no touches to
   the safety-rail paths listed above, except for legitimate router
   additions in tiers 6–7).
8. Commit on `UX-4-6-3` with a tier-level message.

### What we do NOT capture

- Modal-, drawer-, or hover-only states (the initial pass is full-page
  landings). Those are verified manually per tier.
- For authenticated-only pages under `/patient/*` and `/doctor/*`, the
  capture script seeds a real Supabase session via the
  `UI_PARITY_PATIENT_EMAIL` / `UI_PARITY_PATIENT_PASSWORD` (and doctor
  equivalents) env vars before navigating. When those env vars are
  not set, the capture still runs and renders the `/auth/login`
  redirect, which is still useful for auth-page parity.

## Global chrome (tier 1)

| # | Item | Canonical target | Action |
| --- | --- | --- | --- |
| G1 | Patient sidebar | `src/components/PortalShell.tsx` (patient side) | Refresh colors, spacing, active-item bar, collapse animation, icon sizing. Keep our real nav items + i18n labels. |
| G2 | Patient top nav | `src/components/PortalShell.tsx` (patient header) | Refresh header layout, portal switcher pill, EN/عربي pill, avatar bubble, search affordance. Keep our language switcher + real auth user + account menu. |
| G3 | Doctor sidebar | `src/components/PortalShell.tsx` (doctor side) | Refresh sidebar treatment to match global tokens; keep the Today stats block (appointments / done / revenue / critical alerts) and all nav groupings. |
| G4 | Doctor top nav | `src/components/PortalShell.tsx` (doctor header) | Refresh queue badge / status chips / notification bell / account menu; all data from `use-doctor-portal-chrome`. |
| G5 | Utility classes | `src/index.css` (`ceenai-*` layer) | Add any repeated Tailwind patterns as `ceenai-*` utility classes. No global overrides. |
| G6 | Page header atom | `src/components/PageHeader.tsx` | Visually align title/subtitle/actions slot; preserve the existing props API. |

## In-scope for this pass (MVP per `docs/agent/mvp-scope.md`)

Legend: **Keep** = canonical file stays, we only restyle JSX; **Port** = lift specific styling blocks; **Leave** = already aligned or out of scope.

### Public / marketing

| Route | Our file | Reference file | Action |
| --- | --- | --- | --- |
| `/` | `src/pages/public/Home.tsx` (649 L) | `src/pages/LandingPage.tsx` (788 L) | Keep. Port hero/feature card styling, CTA button styles, section spacing. Keep CeenAiX copy + i18n keys. |
| `/ai-chat` | `src/pages/public/AIChat.tsx` | (no counterpart) | Leave. |
| `/find-doctor`, `/find-clinic`, `/insurance`, `/health-education` | `src/pages/public/*` | (no dedicated counterpart) | Leave. |
| `/laboratories`, `/pharmacy` | `src/pages/public/*` | reference Phase-3 pages | Leave; reference variants are post-MVP. |

### Auth

| Route | Our file | Reference file | Action |
| --- | --- | --- | --- |
| `/auth/login` | `src/pages/auth/Login.tsx` (375 L) | `src/pages/Login.tsx` (306 L) | Keep. Port card/frame, inputs, focus rings, optional split-illustration hero. Keep Supabase auth + OTP + language switcher + error handling. |
| `/auth/register` | `src/pages/auth/Register.tsx` (582 L) | `src/pages/SignUp.tsx` (404 L) + `src/components/steps/Step1..5` | Keep. Port stepper visuals, form card styling, button styles. Do not replace our multi-step state machine or Supabase onboarding. |
| `/auth/forgot-password` | `src/pages/auth/ForgotPassword.tsx` (188 L) | (none specific) | Port card styling from the reference login card. |
| `/auth/verify-otp` | `src/pages/auth/VerifyOTP.tsx` (191 L) | (none specific) | Port OTP box styling from SignUp step. |
| `/auth/onboarding` | `src/pages/auth/Onboarding.tsx` (484 L) | reference `Step*` components | Keep. Port per-step card visuals only. |
| `/auth/portal-access` | `src/pages/auth/PortalAccess.tsx` (257 L) | `src/pages/RoleLogin.tsx` (298 L) | Keep. Port portal tile styles, icon treatment, hover. Keep our portal list. |

### Patient portal

| Route | Our file | Reference file | Action |
| --- | --- | --- | --- |
| `/patient/dashboard` | `src/pages/patient/Dashboard.tsx` (1045 L, recovered) | `src/pages/PatientDashboard.tsx` (633 L) | Keep. Structure already matches; a visual parity pass on card shadows, chip styles, metric-card colors, iconography. |
| `/patient/appointments` | `src/pages/patient/Appointments.tsx` (450 L) | `src/pages/Appointments.tsx` + `src/components/appointments/*` | Keep. Port `AppointmentCard`, `FilterPanel`, `WeekCalendar`, `TeleconsultBanner` visuals. Keep our data hooks + booking flow. |
| `/patient/appointments/book` | `src/pages/patient/BookAppointment.tsx` (883 L) | `src/components/appointments/BookAppointmentDrawer.tsx` | Keep. Port drawer/step visuals only. |
| `/patient/prescriptions` | `src/pages/patient/Prescriptions.tsx` (585 L) | `src/pages/Medications.tsx` + `src/components/medications/*Tabs` | Keep. Port tabs + card styling. Keep our live prescriptions data. |
| `/patient/records` | `src/pages/patient/Records.tsx` (1023 L) | `src/pages/PatientRecords.tsx` + `src/pages/MyHealth.tsx` + `src/components/health/*` | Keep. Port tab navigation, `HealthRecordHeader`, Overview/Allergies/Medications/LabResults/Vitals tab chrome. |
| `/patient/ai-chat` | `src/pages/patient/AIChat.tsx` (752 L) | `src/pages/AIAssistant.tsx` + `src/components/ai/*` | Keep. Port message bubble + context rail visuals. Keep our Edge-Function-backed streaming. |
| `/patient/messages` | `src/pages/patient/Messages.tsx` (thin wrapper over `MessagesWorkspace`) | `src/pages/Messages.tsx` + `src/components/messaging/*` | Port `ConversationListPanel`, `ActiveChatPanel`, `MessageBubble`, `MessageInput`, `EmptyState`. Keep Supabase realtime. |
| `/patient/pre-visit/:id` | `src/pages/patient/PreVisitAssessment.tsx` (811 L) | (no dedicated; closest: AI + intake visuals) | Port shared card + Q/A bubble styling only. |
| `/patient/profile` | `src/pages/patient/Profile.tsx` (698 L) | `src/pages/PatientProfile.tsx` + `src/components/patient/PatientDetailView.tsx` | Keep. Port profile hero, section dividers, editable field styling. Keep our `user_profiles` model. |

### Doctor portal

| Route | Our file | Reference file | Action |
| --- | --- | --- | --- |
| `/doctor/dashboard` | `src/pages/doctor/Dashboard.tsx` (585 L) | `src/pages/DoctorDashboardNew.tsx` (880 L) + `src/components/doctor/*` | Keep. Port `CriticalAlertBanner`, `TodaysSchedule`, `AIInsights`, `RecentActivity`, `DailyStats`, `ClinicalAIButton` visuals + card treatments. Keep our hooks + Supabase data. |
| `/doctor/patients` | `src/pages/doctor/Patients.tsx` (229 L) | `src/components/adminPatients/PatientCardGrid.tsx` + `PatientFilterBar.tsx` + `PatientTable.tsx` | Port card grid + filter bar styling. Keep Supabase query + consent gating. |
| `/doctor/patients/:id` | `src/pages/doctor/PatientDetail.tsx` (548 L) | `src/components/patient/PatientDetailView.tsx` + admin `PatientDetailDrawer.tsx` | Port header/summary + section tabs. |
| `/doctor/appointments` | `src/pages/doctor/Appointments.tsx` (671 L) | `src/pages/DoctorAppointments.tsx` + `src/pages/TodaysAppointments.tsx` + `src/components/appointments/*` | Port schedule + card + week calendar visuals. |
| `/doctor/appointments/:id` | `src/pages/doctor/AppointmentDetail.tsx` (638 L) | `src/components/appointments/AppointmentDetailPanel.tsx` | Port panel layout. |
| `/doctor/schedule` | `src/pages/doctor/Schedule.tsx` (642 L) | (no 1:1) | Apply shared card/tab styling. No structural change. |
| `/doctor/prescriptions` | `src/pages/doctor/Prescriptions.tsx` (375 L) | `src/pages/WritePrescription.tsx` list + `src/components/consultation/PrescriptionModal.tsx` | Port list + empty state. |
| `/doctor/prescriptions/new` | `src/pages/doctor/CreatePrescription.tsx` (1082 L) | `src/pages/WritePrescription.tsx` (1028 L) | Port form/section styling, search/selector visuals, dosage chip visuals. Keep our RxNorm + writes. |
| `/doctor/lab-orders`, `/doctor/lab-orders/new` | `src/pages/doctor/LabOrders.tsx` (242 L), `CreateLabOrder.tsx` (871 L) | `src/pages/LabReferrals.tsx` + `LabResultEntry.tsx` + `src/components/labResults/*` | Port form visuals only. Keep our orders model. |
| `/doctor/messages` | `src/pages/doctor/Messages.tsx` (thin wrapper) | `src/pages/DoctorMessages.tsx` + `src/components/messaging/*` | Port visuals via shared `MessagesWorkspace` restyle. |
| `/doctor/notifications` | `src/pages/doctor/Notifications.tsx` (219 L) | `src/pages/NotificationCenter.tsx` + `src/components/notifications/*` | Port category sidebar + notification card. |
| `/doctor/profile` | `src/pages/doctor/Profile.tsx` (1263 L) | `src/pages/DoctorProfile.tsx` + `src/components/doctor/profile/*` | Keep. Port hero, completeness bar, section dividers, danger zone visuals. Keep our `doctor_profiles` model. |

### Admin (minimal per MVP)

| Route | Our file | Reference file | Action |
| --- | --- | --- | --- |
| `/admin/*` | not implemented | `src/pages/Admin*.tsx` + `src/components/admin/*` | Defer. Do not port admin now; keep the design reference snapshot for later. |

### Explicitly excluded this pass (Phase 2 / 3)

- `DoctorEarnings`, `DoctorImaging`, `DoctorPortal`, `DoctorSettings`, `Settings`, `Insurance*`, `InsurancePortal`, `LaboratoryDashboard`, `LabRadiologyPortal`, `Inventory*`, `MRI*`, `Telemedicine*`, `Pharmacy*`, `Diagnostics*`, `Compliance*`, `SystemHealth*`, `OrganizationManagement`, `UserManagement`, `ConsultationWorkspace`.

## New canonical pages (tiers 6 and 7)

The reference snapshot carries pages our canonical repo does not have.
We **do not** stage them under `_bolt/` or mark them with
`@bolt-reference`. Instead each missing page is added as a first-class
canonical page under our standard conventions:

1. Live under `src/pages/<role>/` with a clear domain name
   (e.g., `src/pages/patient/LabResults.tsx`, `src/pages/admin/Users.tsx`).
2. Supporting subcomponents live under `src/components/<domain>/`
   (e.g., `src/components/lab/LabResultCard.tsx`,
   `src/components/notifications/NotificationCard.tsx`).
3. Wired to the router in `src/lib/router.tsx` behind the correct role
   guard (patient / doctor / super_admin).
4. Phase 1 pages have a real data hook (`src/hooks/`) that queries the
   canonical schema. Phase 2 / Phase 3 pages have a typed stub hook
   that returns empty arrays / default objects of the right shape so
   the page renders against `PortalShell` today; data activation is
   gated by the feature's phase.
5. All strings go through i18n (`src/locales/<lang>/common.json`).
6. No `// @bolt-reference`, no `_bolt/` folders, no mention of the
   reference snapshot in code, filenames, or commit messages.

Each addition is captured in `CHECKLIST.md` section 17.2 under the
`UIP-N*` ids.

## Execution order (commit cadence)

One scoped commit per tier on `UX-4-6-3`:

1. **Tier 1 — Global chrome.** UIP-G1 … UIP-G6.
2. **Tier 2 — Patient portal.** UIP-P01 … UIP-P09.
3. **Tier 3 — Doctor portal.** UIP-D01 … UIP-D12.
4. **Tier 4 — Auth.** UIP-A01 … UIP-A06.
5. **Tier 5 — Public.** UIP-L01.
6. **Tier 6 — Phase 1 new pages.** UIP-N01 … UIP-N03.
7. **Tier 7 — Phase 2 / 3 page shells.** UIP-N04 … UIP-N13.

Each tier ends with:

- `npm run typecheck && npm run lint` green.
- `git diff` for the commit empty under `src/hooks/**`,
  `src/lib/supabase.ts`, `src/lib/auth-context.tsx`,
  `src/lib/router.tsx`, `src/types/**` **unless** the tier legitimately
  adds a new route (tiers 6 / 7 only) — in which case the router edit
  is narrowly scoped to the new route and is called out in the commit
  message.
- Re-capture of the tier's routes via `npm run ui-parity:after`.

## Safety rails

- No edits to `src/types/**`, `src/hooks/**`, `src/lib/supabase.ts`,
  `src/lib/auth-context.tsx`, `src/lib/router.tsx` during tiers 1-5.
  Any unavoidable edit is called out in the commit message. Tiers 6-7
  legitimately add new routes + hooks; those additions are additive
  only (no signature changes to existing hooks).
- No edits under `supabase/` or `docs/specs/`.
- No new npm dependencies unless we hit a hard blocker.
- All user-facing text goes through i18n; no hardcoded English strings.
- No `Bolt`, `bolt`, `@bolt-reference`, `_bolt/`, or reference-snapshot
  mentions in any committed file (source, docs, or commit messages).

## Related

- Top-level parity checklist rows live in `CHECKLIST.md` → section
  **17. UI Parity Pass (UIP)**.
- MVP scope source of truth: `docs/agent/mvp-scope.md`.
- Schema source of truth: `docs/agent/schema-reference.md`.

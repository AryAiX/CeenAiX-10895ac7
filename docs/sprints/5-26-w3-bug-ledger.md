# 5-26-w3 Bug-Fix Sprint — Ledger

Sprint branch: `5-26-w3`
Owner: Cursor background agent

Severity: **P0** broken auth/data loss · **P1** user blocked · **P2** wrong data shown · **P3** polish/UX.

| # | Portal/Area | Severity | Symptom | Root cause | Fix | Test |
|---|---|---|---|---|---|---|
| 1 | Auth/router | P2 | `nurse`/`facility_admin` users (and any non-MVP staff role) were redirected to `/auth/onboarding` after sign-in, causing a redirect loop since onboarding is only meaningful for patient/doctor seeding | `getDefaultRouteForRole` only enumerated MVP roles | `src/lib/auth-context.tsx` — `facility_admin` → `/admin/dashboard`; any other recognised role → `/` so sign-in never bounces back to onboarding | `src/lib/auth-context.test.ts` |
| 2 | Patient/Telemedicine | P1 | "View appointment" CTA on telemedicine stub navigated to `/patient/appointments/:id`, a route that does not exist in MVP — effective 404 | Code assumed an unimplemented detail route | `src/pages/patient/TelemedicineConsultation.tsx` — both CTAs send the patient to `/patient/appointments` (live list); copy adapts based on context | covered by upcoming `e2e/multi-role-interactions.spec.ts` |
| 3 | Patient/Profile | P3 | "Scan Emirates ID" button fired a blocking `alert(...)` stub with no functional follow-up | OCR scan is a Phase 2 feature with no stand-in | `src/pages/patient/Profile.tsx` — `handleScanEmiratesId` now opens the existing front-side image picker so the button is at least useful for upload | manual |
| 4 | Pharmacy/Messages | P2 | "Send" button silently cleared the draft with no persistence, no disabled state and no user feedback that outbound replies were not wired | Bolt prototype hadn't been replaced with a real mutation; pharmacy reply tables are out of MVP scope | `src/pages/pharmacy/Messages.tsx` — send button now disabled when draft is empty, with explicit "coming soon" tooltip + inline note | manual |
| 5 | Doctor/Appointments | P3 | "Day" and "Month" calendar toggles had no `onClick` and silently did nothing | Only Week view is implemented for MVP | `src/pages/doctor/Appointments.tsx` — Day/Month buttons disabled with "coming soon" titles | manual |
| 6 | Doctor/Appointments | P2 | Calendar tile styling branched on `appointment.status === 'checked_in'`, a value not in the canonical `appointments.status` enum, so the highlight code was dead and `confirmed` rows had no styling treatment | Drift from spec enum | `src/pages/doctor/Appointments.tsx` — branch now keys off canonical `confirmed` status | manual |
| 7 | Vitest config | P1 | `npm test` ran Playwright spec files through Vitest and crashed with `test.describe() called outside of test file` | Vitest had no exclude for `e2e/**`; both runners ran on the same glob | `vite.config.ts` — added `test.exclude: ['e2e/**', 'node_modules/**', 'dist/**']` so `npm test` ignores Playwright suites | implicit (test run now green) |

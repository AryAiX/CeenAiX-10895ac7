# Executive Report

Date: 2026-04-26  
Project: CeenAiX  
Scope: Pharmacy and insurance operational portals promoted from Bolt-parity demo surfaces to Supabase-backed workspaces; insurance account creation and role routing completed; auth entry styling normalized across roles; CI / production deploy readiness restored  
Reference: [Development Checklist](../../CHECKLIST.md)  
DHA Reference: [DHA Integration Checklist](../../DHA_INTEGRATION_CHECKLIST.md)

## Executive Summary

For the week ending 2026-04-26, CeenAiX moved the **pharmacy and insurance portals from visual prototypes into database-backed operational workspaces**. Last week established the first-class lab / pharmacy / insurance portal shells and Bolt-aligned visual language. This week focused on the two biggest remaining credibility gaps: pharmacy and insurance needed real schema, seed data, hooks, role-aware routing, and portal pages that render from Supabase rather than from hardcoded UI fixtures.

The largest change was the new **pharmacy and insurance operations data layer**. A canonical migration added tenant-scoped operational tables anchored to `organizations` and `organization_members`, plus dedicated tables for pharmacy facility profiles, staff, inventory items, inventory batches, dispensing tasks, claims, messages, settings, insurance payer profiles, members, pre-authorizations, claims, fraud alerts, network providers, risk segments, report runs, and settings. Seed data was applied to production Supabase and verified directly from the database. The frontend hooks were then rebuilt so pharmacy reads from `pharmacy_*` records and insurance reads from `insurance_*` records instead of page-level arrays or phase stubs.

The second major change was **portal parity completion for pharmacy and insurance**. Pharmacy was expanded beyond dashboard / dispensing / inventory into a full sidebar set matching the Bolt reference: Reports, Revenue, My Pharmacy, Settings, and Messages. Insurance was rebuilt from a generic violet `OpsShell` landing page into a dedicated dark-blue payer workspace with Dashboard, Pre-Authorizations, Claims, Members, Fraud Detection, Risk Analytics, Network Providers, Reports, and Settings. A dashboard parity pass restored the missing `Claims Today` chart/card and made it data-backed from `insurance_claims`, including approved, pending, denied, and appealed buckets.

Finally, the week closed by validating production readiness. The branch was merged and deployed successfully. The GitHub workflows were inspected: CI runs lint, typecheck, and build; production release runs Vercel build/deploy only and does not run Supabase migrations. The exact CI commands were made green locally by clearing hook dependency warnings, and the final frontend deploy now builds cleanly against the already-applied production Supabase schema. One database process risk remains: Supabase migration history is still not clean because several migrations, including this week’s, were applied through direct `db query` execution rather than normal `db push`.

## What We Accomplished

### 1. Made the pharmacy portal Supabase-backed instead of UI-derived

- Added first-class pharmacy operations tables for facility profile, staff, inventory catalog, inventory batches, dispensing tasks, claim ledger rows, messages, and settings, all scoped by `organization_id` and protected by RLS helper policies.
- Rebuilt `usePharmacyPrescriptionQueue` so it now reads from `organizations`, `pharmacy_facility_profiles`, `organization_staff_members`, `pharmacy_inventory_items`, `pharmacy_inventory_batches`, `pharmacy_dispensing_tasks`, `pharmacy_claims`, `pharmacy_messages`, and `pharmacy_settings`.
- Replaced derived pharmacy inventory logic with real SKU and batch records, including on-hand stock, reorder thresholds, next expiry, controlled substance flags, DHA formulary flags, and batch counts.
- Replaced synthetic pharmacy revenue with real `pharmacy_claims` records, including payer name, amount, status, submitted timestamp, paid timestamp, and linked dispensing task context.
- Replaced static pharmacy messages and local-only settings with seeded `pharmacy_messages` and `pharmacy_settings` records.

### 2. Completed the full Bolt-style pharmacy portal surface

- Expanded the pharmacy sidebar and routes to include Dashboard, Dispensing, Inventory, Messages, Reports, Revenue, My Pharmacy, and Settings.
- Reworked Pharmacy Inventory to the richer Bolt-style inventory management page with KPI cards, filter tabs, search, stock status classification, controlled / DHA formulary filters, and mobile-friendly item cards.
- Added Pharmacy Reports with dispensing volume, inventory risk breakdown, top dispensed drugs, and DHA monthly report sections, now driven from pharmacy tasks, inventory, and report metrics.
- Added Pharmacy Revenue with payer breakdown, projected queue value, claims in review, average prescription value, and a recent revenue ledger sourced from `pharmacy_claims`.
- Added Pharmacy Profile and Settings pages backed by facility profile, staff, settings, and operations status records.
- Added Pharmacy Messages backed by seeded pharmacy communications instead of fixed local message threads.

### 3. Made the insurance portal Supabase-backed instead of stubbed

- Added insurance operations tables for payer profile, members, pre-authorizations, claims, fraud alerts, network providers, risk segments, report runs, and settings.
- Replaced `useInsurancePortalStub` with a new `useInsurancePortal` hook querying the new insurance tables through Supabase.
- Bound all insurance dashboard KPIs, sidebar badges, pre-auth queues, claims lists, member cards, fraud alerts, risk analytics, network provider rows, report runs, and settings toggles to database records.
- Added a follow-up migration to support and seed `appealed` insurance claims so the dashboard claims chart can show the same status bucket shape as Bolt.
- Verified seeded production DB counts for key tables, including `insurance_pre_authorizations`, `insurance_claims`, and `insurance_fraud_alerts`.

### 4. Rebuilt the insurance portal to match the Bolt payer workspace

- Replaced the generic insurance `OpsShell` page with a dedicated dark-blue payer shell matching the Bolt reference sidebar and top bar.
- Added routed tabs for Dashboard, Pre-Authorizations, Claims, Members, Fraud Detection, Risk Analytics, Network Providers, Reports, and Settings, including Bolt-compatible aliases such as `/insurance/preauth` and `/insurance/analytics`.
- Added the top SLA alert pattern for overdue pre-authorizations and active fraud badges in the shell.
- Restored the missing dashboard `Claims Today` breakdown chart/card and made it data-backed from `insurance_claims`, grouping approved, pending, denied, and appealed records with AED totals and exposure per active member.
- Kept the split-tab approach for maintainability while preserving the dashboard content that Bolt showed on the first tab.

### 5. Completed insurance account creation, login, and role routing

- Added `insurance` to the frontend `UserRole` union, auth role validation, onboarding role list, registration role list, and protected route handling.
- Added a Supabase migration for the `insurance` database enum value and applied it to production so insurance onboarding no longer fails on `invalid input value for enum user_role: "insurance"`.
- Updated the default insurance route to `/insurance/dashboard`.
- Protected all insurance routes with `allowedRoles={['insurance']}`.
- Removed the temporary client-side database workaround idea and solved the role problem in the database, as required.

### 6. Normalized auth entry styling across all portal roles

- Refined `AuthShell` and `Register` so account creation no longer looks like the older cyan / blue, large-font patient/doctor-only experience.
- Updated auth copy in English and Arabic to be role-agnostic and appropriate for patients, doctors, pharmacy, lab, insurance, and admin users.
- Added the insurance role tile to registration with matching visual treatment.
- Preserved existing authentication, OTP, onboarding, and role-guard behavior while aligning the entry screens with the current portal-access style.

### 7. Restored CI and deployment confidence

- Confirmed production deploy is frontend-only: GitHub release runs Vercel `pull`, `build`, and `deploy`, but does not run Supabase migrations.
- Applied the new database schema and seed data manually to production Supabase before deployment, so the deployed frontend has the required tables available.
- Ran and fixed the exact CI gate locally: `npx eslint . --max-warnings 0`, `npx tsc --noEmit`, and `npm run build`.
- Cleared React hook dependency warnings in doctor appointments, doctor lab orders, doctor patients, patient insurance, and the updated pharmacy pages so the zero-warning lint gate passes.
- Pushed the final deploy-readiness commit before merge.

## Business Impact

- Pharmacy and insurance are no longer just presentational demos. They now have **real tenant-scoped operational schema, seed data, hooks, and RLS-backed read paths**, which makes stakeholder demos more credible and gives engineering a concrete foundation for workflow actions.
- Insurance account creation and login are now end-to-end viable. An insurance user can register, complete onboarding, and land in the correct insurance workspace instead of being blocked by a database enum mismatch or redirected into the wrong portal.
- Pharmacy now has enough operational breadth for partner review: dispensing queue, inventory, revenue, reports, messages, staff/profile, and settings can all be reviewed as a coherent portal.
- The insurance dashboard now includes the missing claims breakdown chart from Bolt, eliminating a visible parity gap in the first tab while preserving the cleaner split-tab structure for deeper workflows.
- Production deploy is proven for the frontend path. The week ended with a successful deployment and local CI parity checks passing.

## Details

| ID | Item | Status | Completed | Notes |
| --- | --- | --- | --- | --- |
| PHM-02 | Pharmacy operations schema + seed data | done | 2026-04-26 | Added `pharmacy_facility_profiles`, `organization_staff_members`, `pharmacy_inventory_items`, `pharmacy_inventory_batches`, `pharmacy_dispensing_tasks`, `pharmacy_claims`, `pharmacy_messages`, `pharmacy_settings` |
| PHM-03 | Pharmacy DB-backed hook | done | 2026-04-26 | `usePharmacyPrescriptionQueue` now reads pharmacy operational tables instead of deriving inventory / revenue / messages from prescriptions |
| PHM-04 | Pharmacy dashboard / dispensing / inventory parity pass | done | 2026-04-26 | Dashboard KPIs, dispensing filters, inventory cards, stock status, batch/expiry data, and nav badges now backed by Supabase records |
| PHM-05 | Pharmacy Reports, Revenue, My Pharmacy, Settings, Messages | done | 2026-04-26 | Added missing tabs and routed pages; data now sourced from pharmacy claims, messages, settings, facility profile, staff, and inventory records |
| INS-02 | Insurance operations schema + seed data | done | 2026-04-26 | Added payer profile, members, pre-auths, claims, fraud alerts, network providers, risk segments, reports, and settings tables |
| INS-03 | Insurance DB-backed hook | done | 2026-04-26 | New `useInsurancePortal` replaces `useInsurancePortalStub` for the insurance portal |
| INS-04 | Dedicated Bolt-style insurance shell | done | 2026-04-26 | Dark-blue sidebar/topbar shell with Dashboard, Pre-Authorizations, Claims, Members, Fraud Detection, Risk Analytics, Network Providers, Reports, Settings |
| INS-05 | Insurance dashboard claims chart parity | done | 2026-04-26 | Restored `Claims Today` card/chart; grouped approved, pending, denied, appealed records from `insurance_claims`; added appealed status migration + seed |
| INS-06 | Insurance role registration / onboarding / routing | done | 2026-04-26 | Added role to frontend types, registration, onboarding, auth validation, default route, protected routes, and DB enum |
| AUTH-07 | Account creation styling refresh | done | 2026-04-26 | Register and auth shell styling moved away from old blue/large-font version; role-agnostic English/Arabic copy updated |
| OPS-01 | Organization membership / ops RLS helpers | done | 2026-04-26 | Added `organization_members`, `current_user_app_role()`, and `is_current_user_ops_org()` for pharmacy / insurance read scoping |
| DEP-01 | Production deploy readiness | done | 2026-04-26 | Exact CI lint/typecheck/build commands pass locally; production Vercel deploy completed |
| DEP-02 | Supabase migration history repair | risk |  | Production schema has the new tables because migrations were applied manually, but `supabase migration list --linked` still shows local/remote history mismatch that should be repaired before relying on `supabase db push` |
| CI-01 | Clear zero-warning lint gate | done | 2026-04-26 | Stabilized hook dependencies in doctor appointments, doctor lab orders, doctor patients, patient insurance, pharmacy dashboard, and pharmacy reports |

## Deployment Note

The frontend deployment to Vercel is working and the production Supabase database already has this week’s pharmacy and insurance schema/data applied. However, the Supabase migration history remains out of sync because several migrations were executed directly with `db query` instead of through `db push`. This does not block the current deployed application, but it should be corrected before using `supabase db push` again or before provisioning a clean environment from migration history alone.

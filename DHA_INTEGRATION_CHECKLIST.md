# CeenAiX DHA Integration Checklist

> Living tracker for DHA, NABIDH, practitioner registry, Tatmeen, Shafafiya, and related compliance work. Items are **never deleted** - mark as `deprecated` with a reason in Notes.
>
> **Statuses**: `pending` | `in-progress` | `done` | `deprecated`
>
> **Staging note**: "Stage 1" below means the **must-add readiness slice** for the DHA program. It does **not** override the current app MVP scope in `docs/agent/mvp-scope.md`; live DHA integrations remain scheduled for post-MVP delivery unless product direction changes.

Stage 1 is enough for the current MVP because the MVP scope is centered on core CeenAiX product workflows, not on live DHA-connected data exchange. For MVP, the DHA work only needs to be de-risked and made implementation-ready: define the regulatory scope, prepare the approval and HRD documentation set, document the FHIR/auth/security model, confirm residency and compliance controls, and establish sandbox test readiness. That gives the team a complete foundation for later NABIDH and related integrations without pulling external approval timelines and post-MVP portal dependencies into the MVP critical path.

---

## 1. Stage 1 - Must Add Readiness (DHA-S1)

| ID | Item | Status | Added | Justification | Completed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DHA-S1-00 | Convert DHA integration spec into repo-tracked Markdown reference | done | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.docx` should be easily searchable and linkable in-repo | 2026-04-12 | Added `docs/specs/CeenAiX DHA Integration Spec.md` |
| DHA-S1-01 | Create staged DHA integration checklist in repo | done | 2026-04-12 | User requested a dedicated DHA checklist following `CHECKLIST.md` format | 2026-04-12 | Added `DHA_INTEGRATION_CHECKLIST.md` with must-add vs post-MVP staging |
| DHA-S1-02 | Finalize DHA integration scope statement for vendor application | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 requires one scope statement covering patient records, pharmacy dispensing, lab results, and hospital encounter data |  | Keep wording broad enough to avoid needing multiple approval cycles later |
| DHA-S1-03 | Prepare DHA HRD registration package | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 6.3 and 7 list DHA HRD registration as an early prerequisite |  | Include platform purpose, architecture, data handling, and company/legal details |
| DHA-S1-04 | Prepare NABIDH vendor approval submission package | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 identifies NABIDH approval as the critical milestone before live patient data access |  | Collect legal, technical, security, privacy, and contact information in a single package |
| DHA-S1-05 | Produce system architecture and integration boundary diagrams | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 lists architecture diagrams as required documentation |  | Show Supabase, Edge Functions, FHIR adapter layer, external DHA systems, and audit boundaries |
| DHA-S1-06 | Produce canonical-to-FHIR R4 mapping for MVP NABIDH resources | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 defines the MVP FHIR resource map |  | Cover Patient, Encounter, Condition, AllergyIntolerance, MedicationRequest, MedicationStatement, Observation, and DiagnosticReport |
| DHA-S1-07 | Define OAuth 2.0 / JWT integration design for NABIDH access | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 3.1 and 7 require a documented auth implementation |  | Include token lifetimes, refresh flow, secret rotation, and revocation handling |
| DHA-S1-08 | Document UAE data residency and encryption controls for DHA review | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 6 requires UAE-region hosting plus transit/rest encryption controls |  | Tie deployment, storage, backups, and key management back to concrete infrastructure choices |
| DHA-S1-09 | Define clinician-only access gating and audit trail requirements for DHA data | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 6.2 requires license-verified access, role-based controls, and comprehensive access logs |  | Include access, modification, export, and patient-record view events |
| DHA-S1-10 | Define practitioner and facility registry data model extensions | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 4 requires license status, facility IDs, verification history, and compliance document links |  | Extend current canonical profile model without breaking MVP auth and role flows |
| DHA-S1-11 | Create NABIDH sandbox test plan and acceptance checklist | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 includes sandbox testing for all FHIR R4 resources in scope |  | Include happy path, auth failure, patient match failure, rate limit, and audit-log assertions |
| DHA-S1-12 | Clarify SaMD registration threshold for AI clinical decision support | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 6.3 and 10 identify SaMD as a possible blocker for AI-enabled clinical features |  | Resolve whether current AI surfaces stay decision-support only or trigger regulatory submission sooner |

---

## 2. Stage 2 - Post-MVP NABIDH Core Integration (DHA-S2)

| ID | Item | Status | Added | Justification | Completed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DHA-S2-01 | Obtain NABIDH sandbox credentials and configure secure non-production environments | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 places sandbox testing before production approval |  | Keep secrets isolated by environment and track approval-issued credentials separately from app env vars |
| DHA-S2-02 | Build a versioned NABIDH client / FHIR adapter layer | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 3 and 8 require standards-based FHIR integration rather than ad-hoc endpoint calls |  | Centralize auth, retries, audit hooks, resource validation, and version pinning |
| DHA-S2-03 | Implement Emirates ID based patient matching and identity-link workflow | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.1 names EID as the master patient identifier |  | Must handle ambiguous matches, missing EID, and user-consent edge cases safely |
| DHA-S2-04 | Implement read access for NABIDH `Patient` and `Encounter` resources | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks both as MVP resources |  | Use read-only sync first; avoid silent overwrites of local canonical records |
| DHA-S2-05 | Implement read access for NABIDH `Condition` and `AllergyIntolerance` resources | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks diagnoses and allergies as MVP resources |  | Preserve provenance so imported external conditions remain distinguishable from locally entered data |
| DHA-S2-06 | Implement read access for NABIDH `MedicationRequest` and `MedicationStatement` resources | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 3.2 and 9 require medication history across clinician and patient surfaces |  | Reconcile clinician-issued vs patient-reported medication sources cleanly |
| DHA-S2-07 | Implement read access for NABIDH `Observation` and `DiagnosticReport` resources | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks labs and vitals as MVP resources |  | Respect LOINC coding, reference ranges, and report-vs-observation grouping semantics |
| DHA-S2-08 | Add patient consent, visibility, and provenance UX for imported DHA records | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 6 and 9 require controlled access and clear portal-level behavior |  | Keep patient-portal views read-safe and show source system / import timestamps |
| DHA-S2-09 | Enforce practitioner-license checks before clinician NABIDH access | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 3.1 and 6.2 restrict NABIDH data access to licensed clinicians |  | Gate record access on verified DHA status, not just app role |
| DHA-S2-10 | Run NABIDH sandbox validation across all Stage 2 resource flows | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 requires sandbox testing before production approval |  | Track test evidence for technical review and final approval package |
| DHA-S2-11 | Complete third-party penetration test for DHA-connected surfaces | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 6 and 7 require penetration testing before go-live |  | Include multi-tenant isolation, audit integrity, token handling, and PHI exposure scenarios |
| DHA-S2-12 | Execute DHA data sharing agreement and prepare production approval handoff | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 7 lists the legal agreement and production credential issuance as final gating steps |  | Bundle technical review outcomes, sandbox evidence, and legal artifacts together |

---

## 3. Stage 3 - Post-MVP Operational DHA Integrations (DHA-S3)

| ID | Item | Status | Added | Justification | Completed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DHA-S3-01 | Integrate DHA Practitioner Registry for onboarding and nightly re-verification | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 4.1 requires real-time verification plus scheduled re-checks |  | Support verified / expired / not-found statuses and historical verification logs |
| DHA-S3-02 | Integrate DHA Facility Registry for clinic and pharmacy facility linkage | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 4.2 defines facility ID linkage and status checks |  | Include daily re-verification and stored compliance documents |
| DHA-S3-03 | Add DHA verification badges and re-check actions to staff/admin surfaces | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 4 expects visible status output and manual re-check workflows |  | Covers doctor, pharmacist, nurse, and facility management screens |
| DHA-S3-04 | Add prescription verification against DHA practitioner registry before display | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 4.1 explicitly calls for Rx verification status |  | Show DHA Verified / Unverified state on prescription surfaces with audit linkage |
| DHA-S3-05 | Implement MOHAP drug formulary sync and local cache refresh workflow | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 5.3 calls for weekly sync and local PostgreSQL cache |  | Coordinate with existing medication catalog work instead of duplicating data models |
| DHA-S3-06 | Integrate Tatmeen stock, expiry, recall, and controlled-substance data flows | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 5.1 defines the pharmacy track-and-trace requirements |  | Starts once pharmacy role/workspace is in approved scope |
| DHA-S3-07 | Implement Shafafiya DHA eClaims submission and insurer response tracking | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 5.2 defines claims workflow, prior auth, and response-code audit |  | Depends on future insurance and pharmacy billing workflows |
| DHA-S3-08 | Add lab portal result write-back workflow to NABIDH using FHIR / HL7 interfaces | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 8 and 9 require lab-facing result exchange via FHIR and HL7 v2.5 |  | Align with future lab role, LIS interfaces, and canonical lab order/result models |
| DHA-S3-09 | Add DHA integration monitoring to super admin operational surfaces | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 9 defines system-wide status monitoring for Super Admin |  | Include integration health, credential status, sync failures, and compliance alerts |

---

## 4. Stage 4 - Post-MVP Advanced Interoperability & Expansion (DHA-S4)

| ID | Item | Status | Added | Justification | Completed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DHA-S4-01 | Add NABIDH support for `ImagingStudy` references and imaging-linked workflows | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks imaging as post-MVP |  | Likely needs viewer-link strategy rather than binary image replication |
| DHA-S4-02 | Add NABIDH support for `Procedure` and surgical history exchange | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks procedures as post-MVP |  | Map into doctor and patient record timelines with provenance and code standards |
| DHA-S4-03 | Add NABIDH support for `CarePlan` and longitudinal treatment-plan exchange | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks care plans as post-MVP |  | Requires UX decisions around locally authored vs externally imported care plans |
| DHA-S4-04 | Add `ServiceRequest` write workflows for referrals and downstream orders | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 3.2 marks referrals/write access as post-MVP |  | Should follow approval and consent rules before any cross-system writeback |
| DHA-S4-05 | Add `DocumentReference` / C-CDA clinical document exchange | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 3.2 and 6.3 call out C-CDA v2.1 document interoperability |  | Includes discharge summaries, referral letters, and document provenance |
| DHA-S4-06 | Extend identity and record access strategy for UAE Pass assisted flows | pending | 2026-04-12 | `docs/specs/10-integrations.md` and `docs/specs/CeenAiX DHA Integration Spec.md` both position EID-centered identity as part of broader UAE interoperability |  | Keep separate from current MVP auth unless product explicitly advances it |
| DHA-S4-07 | Evaluate Riayati and Malaffi expansion path after Dubai-first approval | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Section 2 lists cross-emirate expansion as post-MVP |  | Reuse FHIR adapter and compliance patterns where possible |
| DHA-S4-08 | Build DHA-facing analytics and compliance reporting surfaces | pending | 2026-04-12 | `docs/specs/CeenAiX DHA Integration Spec.md` - Sections 9 and 10 imply ongoing audit, reporting, and compliance monitoring needs |  | Best kept after core live integrations are stable |

---

## 5. Assumptions Made

| ID | Assumption | Added | Notes |
| --- | --- | --- | --- |
| DHA-ASM-01 | Stage 1 means must-add DHA readiness work, not full live DHA connectivity inside the current MVP build | 2026-04-12 | This keeps the checklist aligned with `docs/agent/mvp-scope.md` and `docs/specs/13-phased-roadmap.md`, which still place DHA integration after MVP |
| DHA-ASM-02 | The current Supabase-centric architecture remains the implementation baseline unless DHA constraints force an auxiliary FHIR service or gateway | 2026-04-12 | The DHA spec references broader backend options, but this repo should avoid unnecessary platform drift until technically required |
| DHA-ASM-03 | Practitioner registry, facility registry, Tatmeen, and Shafafiya work depend on future pharmacy, lab, insurance, and expanded admin surfaces entering approved scope | 2026-04-12 | The checklist tracks them now so planning can start, but most delivery work remains post-MVP |

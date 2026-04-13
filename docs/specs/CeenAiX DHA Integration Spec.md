# CeenAiX

National AI Healthcare Platform

## DHA Integration Technical Specification

Prepared for: Tooraj Helmi, CTO & Co-Founder  
AryAiX LLC - Dubai, UAE - info@aryaix.com  
April 2026 - CONFIDENTIAL

## 1. Executive Summary

This document defines the complete technical integration specification between CeenAiX and the Dubai Health Authority (DHA) ecosystem. It is the primary backend reference for Tooraj Helmi, CTO & Co-Founder, covering all integration layers, API standards, FHIR resource maps, authentication flows, compliance requirements, and the phased build roadmap.

CeenAiX's integration strategy is built on a single master key: NABIDH, the Dubai Health Information Exchange, which connects 1,500+ DHA-licensed facilities and consolidates over 9.5 million patient records. By achieving NABIDH vendor approval, CeenAiX gains unified access to hospital, pharmacy, and lab data across all of Dubai under one integration framework.

Secondary integrations cover the DHA Licensing and Practitioner Registry APIs, Tatmeen pharmaceutical track-and-trace, Shafafiya insurance claims, and MOHAP drug formulary APIs. Together these form the full DHA integration stack for CeenAiX.

## 2. DHA Ecosystem - Integration Map

The following platforms constitute the Dubai Health Authority integration ecosystem relevant to CeenAiX:

| Platform | Governing Body | CeenAiX Integration Purpose |
| --- | --- | --- |
| NABIDH HIE | DHA / Dubai Health | Master patient record access across all facilities; FHIR R4 API; Patient, Encounter, Condition, MedicationRequest, Lab, Imaging |
| DHA Practitioner Registry | DHA Health Regulation Dept | Real-time doctor and pharmacist license verification; auto-verify new staff onboarding |
| DHA Facility Registry | DHA Health Regulation Dept | Pharmacy and clinic DHA facility ID linkage; linked to Pharmacy Admin Portal settings |
| Tatmeen | MOHAP / DHA authorised | Pharmaceutical track-and-trace; real-time drug stock, expiry, recalls, GS1 barcodes |
| Shafafiya | UAE Insurance Authority | DHA eClaims v3.2 insurance submission; HAAD/DHA claim standards |
| MOHAP Drug API | Ministry of Health & Prevention | Registered drug formulary; drug reference data for prescription engine |
| Riayati | SEHA / National | National patient records for Abu Dhabi; post-MVP cross-emirate access |
| Malaffi | Abu Dhabi Health Services | Abu Dhabi HIE equivalent; post-MVP expansion |

## 3. NABIDH Integration - Core Layer

NABIDH (National Backbone for Integrated Dubai Health) is the foundation of all CeenAiX clinical data integration. Every DHA-licensed facility in Dubai is connected to NABIDH, making it the single integration point for patient record access across the entire Dubai healthcare system.

### 3.1 Authentication & Access

| Area | Specification |
| --- | --- |
| Auth Protocol | OAuth 2.0 with JWT bearer tokens |
| Token Scope | `Patient/read`, `Encounter/read`, `Condition/read`, `MedicationRequest/read` - role-restricted to licensed clinicians only |
| Patient Identifier | Emirates ID (EID) as master patient identifier for cross-facility record matching |
| Session Management | JWT expiry: 1 hour access token; 24-hour refresh token; revocation on logout |
| TLS | TLS 1.2 minimum; all NABIDH API traffic encrypted in transit |
| Data Residency | All data remains UAE-region: AWS ME-SOUTH-1 (Bahrain) or Azure UAE North |

### 3.2 FHIR R4 Resource Map

CeenAiX implements FHIR R4 as its primary clinical data standard, aligned with NABIDH's API specification. The following resource map defines MVP vs. post-MVP scope:

| FHIR R4 Resource | Clinical Purpose | MVP | Post-MVP |
| --- | --- | --- | --- |
| Patient | Demographics, EID linkage, language preference | Yes |  |
| Encounter | Past visits, admissions, discharge dates | Yes |  |
| Condition | Diagnoses, ICD-10-CM codes, chronic conditions | Yes |  |
| AllergyIntolerance | Drug and food allergies with severity | Yes |  |
| MedicationRequest | Active prescriptions, dosage, prescriber | Yes |  |
| MedicationStatement | Patient-reported medications, OTC drugs | Yes |  |
| Observation | Lab results, vitals (LOINC codes) | Yes |  |
| DiagnosticReport | Lab reports, radiology narrative results | Yes |  |
| ImagingStudy | DICOM study references, radiology links |  | Yes |
| Procedure | Surgical history, procedures performed |  | Yes |
| CarePlan | Ongoing treatment plans |  | Yes |
| ServiceRequest | Referrals out - write access |  | Yes |
| DocumentReference | Discharge summaries, clinical letters (C-CDA v2.1) |  | Yes |

### 3.3 Clinical Coding Standards

| Domain | Standard |
| --- | --- |
| Diagnoses | ICD-10-CM for all `Condition` resources |
| Clinical Terms | SNOMED CT for procedures, findings, body structures |
| Observations / Labs | LOINC for all `Observation` and `DiagnosticReport` codes |
| Medications | RxNorm (US) plus DHA drug codes for all `MedicationRequest` resources |
| Clinical Documents | C-CDA v2.1 for discharge summaries and clinical letters |
| Pharmacy Track-and-Trace | GS1 / GTIN barcodes for Tatmeen integration |
| Insurance Claims | DHA eClaims Format v3.2 |

## 4. DHA Practitioner & Facility Registry APIs

The DHA operates real-time registry APIs for verifying the licensure status of healthcare professionals and facilities. These are critical dependencies for CeenAiX's Pharmacy Admin Portal, Doctor Portal, and Super Admin Panel.

### 4.1 Practitioner Registry

| Area | Specification |
| --- | --- |
| API Purpose | Verify DHA license status for doctors, pharmacists, nurses, and all clinical staff |
| Trigger - Onboarding | Auto-verify license when any clinical staff member is added to any CeenAiX portal |
| Trigger - Ongoing | Scheduled nightly re-verification of all active clinical staff licenses |
| Output | Verified (green), Expired (red), or Not Found (amber) status badge on staff profile |
| Prescription Verification | All incoming prescriptions auto-verified against the DHA Practitioner Registry before display; shows DHA Verified or Unverified on each prescription |
| DHA License Number | Stored against staff profile; displayed in staff management and verification logs |
| Manual Re-check | Admin-triggered manual verification available from staff management and DHA Settings tab |
| Audit Log | All verifications logged with date, staff name, license number, verification type, DHA result, and status |

### 4.2 Facility Registry

| Area | Specification |
| --- | --- |
| API Purpose | Link pharmacy or clinic DHA Facility ID; verify facility registration status with DHA |
| Facility ID Format | `DHA-PH-YYYY-NNNNN` for pharmacy / `DHA-CL-YYYY-NNNNN` for clinic |
| Verification Frequency | Real-time on portal login plus scheduled daily re-verification |
| DHA Profile Fields | Facility Name, Facility ID, Facility Type, Registration Date, Licensed Services, Status |
| Link to Pharmacy Portal | DHA Integration settings tab in Pharmacy Admin Portal shows full DHA facility profile and live status |
| Compliance Documents | DHA License, Operating Agreement, Inspection Report, Controlled Substance Registration - stored and linked from portal |

## 5. Pharmacy Integration Stack

The Pharmacy Portal requires three distinct API integrations beyond NABIDH: Tatmeen for pharmaceutical track-and-trace, Shafafiya for insurance claim submission, and MOHAP for drug reference data.

### 5.1 Tatmeen - Pharmaceutical Track-and-Trace

Tatmeen is the UAE's national pharmaceutical serialisation and track-and-trace platform, initiated by MOHAP. It provides real-time drug movement data, recalls, expiry alerts, and stock insights.

| Area | Specification |
| --- | --- |
| Governing Body | MOHAP; authorised access requires DHA/MOHAP registration as a healthcare entity |
| GS1 / GTIN | All drug items carry GS1 barcodes; Tatmeen tracks by GTIN at unit level |
| Real-Time Data | Drug movements, stock on hand per facility, expiry dates, recall notifications |
| Recall Engine | Tatmeen recall events push to the CeenAiX pharmacy stock module; affected stock flagged automatically |
| Expiry Alerts | Stock nearing expiry surfaced in pharmacy inventory dashboard with configurable threshold of 30, 60, or 90 days |
| Controlled Substances | Tatmeen tracks controlled substance quantities; integrates with DDA (Drug and Drug Control Department) reporting |
| Integration Type | REST API; requires registered MOHAP/DHA entity credentials |

### 5.2 Shafafiya - Insurance Claims (DHA eClaims)

| Area | Specification |
| --- | --- |
| Standard | DHA eClaims Format v3.2; all insurance claim submissions from CeenAiX must use this format |
| Claim Types | Outpatient consultations, pharmacy dispensing, lab results, procedures |
| UAE Insurers Supported | Daman, AXA Gulf, MSH International, Bupa Arabia, MetLife, Oman Insurance, Orient Insurance, Nextcare, Neuron, ADNIC |
| Claim Workflow | Encounter -> Claim created -> DHA eClaims format -> Shafafiya submission -> Approval / Rejection -> Settlement |
| Prior Auth | Pre-authorisation requests submitted via Shafafiya for high-cost procedures |
| Compliance Badge | DHA eClaims Compliant badge displayed in Pharmacy Admin Portal DHA Integration tab |
| Audit | Full claim history with insurer response codes stored per transaction |

### 5.3 MOHAP Drug Formulary API

| Area | Specification |
| --- | --- |
| API Source | MOHAP Open Data API - `mohap.gov.ae/en/open-data/open-data-api` |
| Data Available | Complete list of MOHAP-registered drug products; generic and trade names, ATC codes, dosage forms, approval status |
| CeenAiX Use | Powers prescription engine drug lookup, autocomplete in prescribing interface, and drug interaction cross-reference |
| Refresh Frequency | Weekly sync recommended; MOHAP API allows automated polling |
| Local Cache | Drug formulary stored in CeenAiX database (PostgreSQL) for performance and synced against MOHAP on schedule |

## 6. Security, Data Governance & Compliance

### 6.1 Data Residency & Encryption

| Area | Specification |
| --- | --- |
| Cloud Hosting | UAE-region only: AWS ME-SOUTH-1 (Bahrain) or Azure UAE North. No data stored or processed outside UAE |
| Encryption in Transit | TLS 1.2+ for all API traffic and all portal sessions |
| Encryption at Rest | AES-256 for all databases and storage volumes |
| Key Management | AWS KMS or Azure Key Vault; keys rotated quarterly |
| Database | PostgreSQL (primary EHR data) + MongoDB (unstructured clinical notes) + Redis (session cache) |
| Backup | Daily encrypted backups, UAE-region only, 90-day retention, point-in-time restore |

### 6.2 Access Control

| Area | Specification |
| --- | --- |
| Model | Role-Based Access Control (RBAC); permissions tied to clinical role, not individual |
| Patient Record Access | Only licensed clinicians with verified DHA license can access NABIDH patient records in CeenAiX |
| Role Hierarchy | Super Admin > Clinic Admin > Doctor > Pharmacist > Lab Technician > Receptionist (read-only) |
| Audit Trail | Every record access, modification, and export logged with user ID, role, timestamp, patient ID, action, and IP address |
| Session Timeout | Automatic session expiry after 15 minutes of inactivity for clinical workstations |
| MFA | Multi-factor authentication required for Super Admin and Clinic Admin roles |

### 6.3 Regulatory Compliance Framework

| Area | Specification |
| --- | --- |
| NABIDH Compliance | NABIDH Minimum Data Set (MDS); HL7 v2.5 messaging; C-CDA v2.1 document exchange; FHIR R4 API |
| DHA AI Circular | Compliance with DHA's AI governance circular: transparency in AI-enabled functions, validation documentation, clinician-in-the-loop for AI-assisted decisions |
| UAE Federal Data Law | UAE Federal Data Protection Law (Federal Decree-Law No. 45 of 2021): data subject rights, consent management, breach notification |
| SaMD Registration | CeenAiX AI clinical decision support module may require SaMD (Software as a Medical Device) registration with MoHAP; Pedram to lead regulatory submission |
| DHA HRD Registration | CeenAiX platform registered with DHA Health Regulation Department; confirms system purpose, architecture, data handling |
| HIPAA (U.S. alignment) | Architecture aligned with HIPAA administrative, physical, and technical safeguards; supports U.S. market expansion and DHA credibility positioning |
| Insurance Compliance | DHA eClaims v3.2, HAAD standards for Abu Dhabi expansion, Daman network compliance |

## 7. NABIDH Vendor Approval - Process & Checklist

NABIDH vendor approval is CeenAiX's most critical regulatory milestone. It is required before any live patient data access can occur. One approval covers all portal types - hospital, pharmacy, and lab access - provided the scope statement is comprehensive.

Key point for the application: ensure the scope statement explicitly mentions all data types required - patient records, pharmacy dispensing data, lab results, and hospital encounter data. One submission gives full coverage across all three integration domains.

### Application Requirements

- Company legal name: AryAiX LLC
- DET Trade License Number: `[INSERT BEFORE SUBMISSION]`
- Contacts: CEO: Parnia Yazdkhasti | COO / Primary Contact: Pedram Vaziri
- Technical contact: CTO / Technical Contact: Tooraj Helmi | `tooraj.h@aryaix.com`

### Technical Documentation Required

- System architecture diagram - cloud infrastructure, data flows, API boundaries
- FHIR R4 resource map with access scope (see Section 3.2)
- Security documentation - encryption, access control, audit logging specifications
- Data residency confirmation - UAE-region cloud hosting only
- OAuth 2.0 / JWT authentication implementation specification
- Penetration test report (required before go-live; not at application stage)
- Privacy impact assessment - UAE Federal Data Protection Law compliance

### Process Steps

| # | Step | Action | Owner | Target |
| --- | --- | --- | --- | --- |
| 1 | DHA HRD Registration | Register CeenAiX with DHA Health Regulation Department - platform purpose, architecture, data handling | Pedram + Tooraj | Month 1 |
| 2 | NABIDH Application | Submit NABIDH vendor approval application with full technical documentation package | Pedram (lead) + Tooraj (technical) | Month 1-2 |
| 3 | Technical Review | DHA NABIDH team conducts technical review of architecture and FHIR implementation | Tooraj | Month 2-3 |
| 4 | Sandbox Testing | Integrate CeenAiX with NABIDH sandbox and test all FHIR R4 resources in scope | Tooraj | Month 3-4 |
| 5 | Security Audit | Third-party penetration test required before production approval | AryAiX + External | Month 4 |
| 6 | Data Sharing Agreement | Execute DHA Health Data Sharing Agreement - legal instrument for PHI access | Pedram + Parnia | Month 4 |
| 7 | Production Approval | NABIDH production credentials issued; CeenAiX authorised for live patient data | DHA | Month 5 |
| 8 | Tatmeen Registration | Apply for Tatmeen access as MOHAP/DHA-authorised entity | Pedram | Month 3 |
| 9 | SaMD Registration | Submit SaMD registration for AI clinical decision support module if required | Pedram (lead) | Month 6 |

## 8. Backend Technical Stack Reference

| Area | Specification |
| --- | --- |
| Primary Language | Node.js (API layer) + Python (AI/ML models, NLP, clinical decision support) |
| Frontend | React.js (TypeScript) - Tooraj: owned by Parnia; backend API contracts to be defined jointly |
| Primary Database | PostgreSQL - structured EHR data, patient records, prescriptions, appointments |
| Document Store | MongoDB - unstructured clinical notes, AI model outputs, audit logs |
| Cache / Session | Redis - API response caching, session tokens, real-time pharmacy stock cache |
| Cloud | AWS ME-SOUTH-1 or Azure UAE North - UAE data residency; auto-scaling for multi-tenant |
| AI Models | OpenAI GPT-4o + Anthropic Claude - clinical NLP, AI-assisted diagnosis suggestions, document summarization |
| FHIR Server | HAPI FHIR (recommended) or Azure Health Data Services FHIR - FHIR R4 server implementation |
| HL7 Messaging | HL7 v2.5 ADT, ORM, ORU messages - lab and hospital interface |
| API Gateway | AWS API Gateway or Azure API Management - rate limiting, auth middleware, logging |
| CI/CD | GitHub Actions - shared AryAiX GitHub organization; automated deployment pipeline |
| Monitoring | CloudWatch (AWS) or Azure Monitor - uptime, API latency, error rate dashboards |

## 9. Portal-Specific Integration Requirements

| Portal | DHA APIs Required | NABIDH Resources | Other Integrations |
| --- | --- | --- | --- |
| Doctor Portal | Practitioner Registry - license verify on login | Patient, Encounter, Condition, Allergy, MedicationRequest, Observation, DiagnosticReport | MOHAP Drug API (prescription engine), AI clinical decision support (GPT-4o/Claude) |
| Patient Portal | None | Patient (own record only), MedicationStatement, Observation, Appointment | Notification service (SMS/email), Arabic/English bilingual, UAE Pass (future) |
| Pharmacy Admin Portal | Practitioner Registry, Facility Registry, DHA eClaims | MedicationRequest (Rx verification against NABIDH) | Tatmeen (stock/track-trace), Shafafiya (insurance), MOHAP Drug API |
| Lab Portal | Practitioner Registry | DiagnosticReport, Observation - write results back to NABIDH via HIE | Instrument/LIS interfaces (HL7 v2.5 ORM/ORU), LOINC coding engine |
| Super Admin Panel | All DHA APIs - system-wide status monitoring | Full audit access (read-only) across all NABIDH resource types | Billing, analytics, DHA compliance reporting dashboard |
| Insurance Portal | DHA eClaims v3.2 (write) | Encounter, Condition, Procedure (claims basis) | Shafafiya, all UAE insurer APIs, prior auth workflow |

## 10. Integration Risk Register

| Risk | Level | Impact | Mitigation |
| --- | --- | --- | --- |
| NABIDH approval delay | High | Blocks live patient data access and affects all portal go-live dates | Begin application in Month 1, engage DHA relationship via Pedram, and use sandbox for development throughout |
| DHA API specification changes | Medium | FHIR resource schema or auth changes require backend updates | Subscribe to NABIDH developer newsletter, maintain version-pinned integration, and buffer 2 weeks in roadmap for API changes |
| Tatmeen access denial | Medium | Blocks real-time pharmacy stock and recall integration | Apply as DHA-authorised entity concurrently with NABIDH and use MOHAP Drug API as fallback for formulary |
| SaMD registration required for AI | Medium | AI clinical decision support features may be delayed if SaMD is required | Engage MoHAP early to determine threshold and design AI features as decision support with clinician-in-loop rather than autonomous diagnosis |
| UAE data residency enforcement | High | Regulatory violation if patient data is processed outside UAE | Deploy all compute and storage in AWS ME-SOUTH-1 or Azure UAE North only and enforce in IaC from day one |
| Multi-tenant data isolation failure | High | PHI cross-contamination between clinic tenants | Enforce tenant ID at database row level with PostgreSQL RLS, run independent audit per tenant, and include multi-tenancy scenarios in the pen test |

## 11. Team Responsibilities

| Team / Person | Responsibility |
| --- | --- |
| Tooraj Helmi (CTO) | Full CeenAiX backend architecture; FHIR R4 / HL7 implementation; NABIDH API integration; AI model development; GitHub codebase ownership; NABIDH sandbox testing; security architecture |
| Parnia Yazdkhasti (CEO) | CeenAiX frontend development (Bolt AI / React + TypeScript); product design document co-authoring with Tooraj; DHA strategic engagement; investor and regulatory narrative |
| Pedram Vaziri (COO) | NABIDH vendor approval application lead; DHA HRD registration; SaMD submission; DHA Health Data Sharing Agreement; Tatmeen and Shafafiya registration; all regulatory submissions |
| Abud Ebrahimi (Dev) | Frontend support tasks as directed; component implementation in React under Parnia's direction |
| AryAiX GitHub Org | All CeenAiX code in shared AryAiX GitHub organization; Tooraj owns backend repos, Parnia owns frontend repos, and PRs are required for all production code |

## 12. Glossary

| Term | Definition |
| --- | --- |
| NABIDH | National Backbone for Integrated Dubai Health - Dubai's Health Information Exchange (HIE) connecting 1,500+ licensed facilities |
| FHIR R4 | Fast Healthcare Interoperability Resources Release 4 - international standard for healthcare data exchange via REST APIs |
| HL7 v2.5 | Health Level Seven version 2.5 - messaging standard for lab orders (ORM) and results (ORU) |
| C-CDA v2.1 | Consolidated Clinical Document Architecture - standard for clinical document exchange (discharge summaries, referrals) |
| LOINC | Logical Observation Identifiers Names and Codes - universal coding for lab tests and observations |
| ICD-10-CM | International Classification of Diseases 10th Revision Clinical Modification - diagnosis coding |
| SNOMED CT | Systematized Nomenclature of Medicine Clinical Terms - clinical concepts coding |
| SaMD | Software as a Medical Device - regulatory classification for software that performs medical functions |
| DHA HRD | Dubai Health Authority Health Regulation Department - oversees healthcare platform registrations |
| Tatmeen | UAE national pharmaceutical track-and-trace platform - serialisation, stock, recalls, expiry data |
| Shafafiya | UAE insurance claims submission platform - DHA eClaims v3.2 format |
| RLS | Row-Level Security - PostgreSQL feature used to enforce multi-tenant data isolation at database level |
| MFA | Multi-Factor Authentication - required for all admin roles in CeenAiX |
| PHI | Protected Health Information - patient data subject to privacy regulation |
| EID | Emirates ID - UAE national identity document; used as master patient identifier in NABIDH |

CeenAiX - AryAiX LLC - Dilan Tower, Al Jadaf, Dubai - info@aryaix.com - CONFIDENTIAL

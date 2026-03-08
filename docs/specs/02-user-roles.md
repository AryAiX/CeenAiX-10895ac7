# 2. User Role Taxonomy

CeenAiX serves multiple distinct stakeholder types across the healthcare journey. User roles are grouped into three tiers.

> Insurance companies are **not** direct platform users. Their products and packages are managed exclusively through the Admin Panel and surfaced to patients during appointment booking and coverage management.

---

## 2.1 Tier 1 — Guest Users (No Account Required)

Guest users access the platform without registration. Core AI features are available to lower the barrier to entry and drive conversion to registered accounts.

| Guest Capability | Description | Account Required? |
|---|---|---|
| AI Health Consultation Chat | Conversational AI agent for symptom assessment, health queries, and general medical information | No |
| Find the Right Doctor | AI-guided specialty and doctor matching based on symptoms, location, language, and rating | No — but required to book |
| Document & Photo Upload in Chat | Upload photos (ID, insurance card, test results, prescriptions) to AI chat for instant analysis | No |
| Browse Doctors & Clinics | Search and filter healthcare providers by specialty, location, availability, and language | No |
| Browse Insurance Plans | View available insurance plans and coverage summaries curated by CeenAiX | No |
| View Medical Articles & Guides | Access health education content and preventive care guides | No |
| Book Appointment | Initiates appointment booking flow — requires account creation at this step | **YES** — triggers registration |

---

## 2.2 Tier 2 — Authenticated Platform Users

### 2.2.1 Patient

The primary end-user. Patients may be UAE nationals, expatriates, or medical tourists. Includes sub-role **Minor Patient** (under 18), linked to a Family Member / Guardian account.

| Feature Area | Feature | Description |
|---|---|---|
| Dashboard | Health Overview | Personalized AI health summary, upcoming appointments, recent activity, medication reminders |
| Dashboard | Health Score | AI-generated health wellness score based on vitals, lifestyle data, and medical history |
| AI Health Agent | Conversational AI Chat | Full ChatGPT-style conversation with CeenAiX AI agent for consultation, queries, and guidance |
| AI Health Agent | Document & Photo Analysis | Attach photos (lab results, prescriptions, ID, insurance card) for AI-assisted form-filling and analysis |
| AI Health Agent | Symptom Checker | Structured and conversational symptom input; AI suggests possible diagnoses and next steps |
| AI Health Agent | Diagnostic Pre-assessment | Pre-visit questionnaire completed with AI before appointment; shared with doctor |
| AI Health Agent | Medication Interaction Check | Patient can query AI about medication safety, interactions, and dosage guidance |
| Appointments | Book Appointment | In-person or virtual appointment booking with selected doctor or facility |
| Appointments | Virtual Consultation | HD video/audio consultation with healthcare provider within platform |
| Appointments | Appointment History | Full log of past and upcoming appointments with notes and outcomes |
| Appointments | Reminders & Notifications | Smart reminders for appointments, medication, follow-ups, and screenings |
| Medical Records | Personal Health Record (PHR) | Complete longitudinal health record: diagnoses, treatments, medications, allergies, surgeries |
| Medical Records | Lab Results & Reports | Upload and receive lab results; AI analyzes and explains findings in plain language |
| Medical Records | Imaging Records | Store and view radiology and imaging reports |
| Medical Records | Vaccination History | Full immunization record with reminders for upcoming vaccines |
| Medical Records | Emergency Access Profile | Condensed critical profile accessible via Emirates ID in emergencies |
| Prescriptions | Digital Prescriptions | View, manage, and share digital prescriptions; AI flags interactions |
| Prescriptions | Pharmacy Dispatch | Send prescription directly to linked pharmacy for pickup or home delivery |
| Preventive Care | Risk Assessment | AI analysis of family history, genetics, lifestyle, and environment for personalized risk profiling |
| Preventive Care | Screening Recommendations | AI-generated personalized screening schedule with reminders |
| Preventive Care | Wellness Goals | Set and track health goals (weight, steps, sleep, diet) with AI coaching |
| Insurance | Active Coverage Overview | View current insurance plan details, coverage limits, and claims status |
| Insurance | Insurance Card Storage | Upload and store digital insurance card; AI auto-reads card via photo |
| Insurance | Claims Tracking | Track submitted claims and reimbursement status |
| Profile & Settings | Personal Profile | Demographics, emergency contacts, language, communication preferences |
| Profile & Settings | Privacy Controls | Granular control over data sharing with providers, family members, and research |
| Profile & Settings | Linked Family Members | Link and manage family accounts (children, dependents, elderly) |

### 2.2.2 Family Member / Guardian

Allows a registered patient to grant access to another person (spouse, parent, adult child) to manage health information and appointments. Critical use case: parent managing a **Minor Patient's** account.

| Feature | Description |
|---|---|
| Linked Patient Profiles | View and manage health records of linked family members (with consent or as legal guardian) |
| Appointment Management | Book, reschedule, and cancel appointments on behalf of linked patients |
| Medication & Reminder Management | Manage medication schedules and health reminders for dependents |
| Lab Results & Reports Access | View and download lab results and reports for linked patients |
| AI Agent Access (on behalf) | Use AI health agent on behalf of a linked patient — context-aware to their records |
| Emergency Profile Management | Manage and update the emergency access profile for dependents |
| Communication Proxy | Receive notifications and communications on behalf of minor or dependent patients |
| Consent Management | Define and adjust access permissions granted to healthcare providers for linked patients |

### 2.2.3 Healthcare Provider — Doctor / Physician

Core clinical users. Manage patient encounters, access AI-assisted clinical decision support, and document care. Both in-person and virtual consultation workflows supported with real-time AI assistant.

| Feature Area | Feature | Description |
|---|---|---|
| Dashboard | Clinical Overview | Today's appointments, pending results, unread messages, AI alerts, and patient follow-up queue |
| Dashboard | Patient Queue | Real-time patient queue for clinic days; status tracking for check-in, in-consultation, and post-visit |
| Patient Management | Patient Search & Profiles | Search and access full patient health profiles (PHR) with permission |
| Patient Management | Pre-visit AI Summary | AI-generated patient summary before each appointment: history, risks, relevant prior diagnoses |
| Patient Management | Consultation Notes (AI-Assisted) | Structured note-taking with AI auto-suggestions, templates, and SOAP note generation |
| AI Consultation Assistant | Live Visit Recording | During visits, AI agent listens, transcribes, and analyses conversation in real time |
| AI Consultation Assistant | Conversation Transcription | Full text transcription of consultation stored securely in patient record (with consent) |
| AI Consultation Assistant | AI Diagnosis Suggestions | AI proposes differential diagnoses based on conversation, symptoms, vitals, and patient history |
| AI Consultation Assistant | Treatment Recommendations | AI surfaces evidence-based treatment options and clinical guidelines |
| AI Consultation Assistant | Medication Interaction Alerts | Real-time alerts for contraindications and drug-drug interactions during prescribing |
| AI Consultation Assistant | Lab & Imaging Order Assistant | AI recommends relevant investigations based on clinical picture; orders submitted digitally |
| Virtual Consultation | Video / Audio Call | Integrated HD video consultation with screen sharing, document sharing, and AI assistant active |
| Virtual Consultation | E-Prescription in Virtual Visit | Issue digital prescriptions during or immediately after virtual appointments |
| Prescriptions | Digital Prescriptions | Create, manage, and send prescriptions to pharmacy directly from the platform |
| Referrals | Specialist Referral | Issue referrals to specialists; AI suggests appropriate specialists |
| Lab & Imaging | Order & Receive Results | Order investigations; receive and review results with AI interpretation support |
| Schedule Management | Availability & Calendar | Manage availability, appointment slots, clinic hours, and vacation/leave |
| Schedule Management | Appointment Types | Configure in-person vs. virtual, duration, fees, and specialty-specific workflows |
| Billing | Fee & Invoice Management | Generate invoices, set fees, and track payment status |
| Analytics | Clinical Performance Dashboard | Patient outcome metrics, consultation volumes, diagnosis time, treatment efficacy |
| Communication | Secure Messaging | HIPAA-equivalent encrypted messaging with patients and colleagues |
| Continuing Education | AI-Powered CME Suggestions | Personalized continuing medical education recommendations |

### 2.2.4 Healthcare Provider — Nurse

Support clinical workflows, patient triage, vital sign recording, and care coordination. Dashboard designed for high-volume patient management with AI triage support.

| Feature | Description |
|---|---|
| Patient Check-In & Triage | Process patient arrivals, record chief complaint, and AI-assisted triage severity scoring |
| Vital Signs Recording | Input and store patient vitals (BP, HR, temperature, SpO2, weight, height) |
| Patient Queue Management | Manage and update the clinical queue; flag urgent or priority patients |
| Medication Administration Record | Document administered medications with timestamps; AI alerts for missed doses or interactions |
| Care Plan Assistance | View and support execution of AI-generated care plans under doctor's orders |
| Lab & Specimen Management | Process and track lab orders, specimen collection, and result routing |
| Patient Communication | Send appointment reminders, preparation instructions, and post-visit follow-up messages |
| Secure Messaging | Communicate with doctors and other clinical staff securely |
| Shift Notes | Document nursing shift notes and handover summaries with AI assistance |

### 2.2.5 Healthcare Provider — Doctor's Assistant / Medical Secretary

Manage administrative aspects of the doctor's practice.

| Feature | Description |
|---|---|
| Appointment Scheduling | Book, reschedule, and cancel appointments on behalf of the supervising doctor |
| Patient Communication | Manage patient communications: confirmations, reminders, and follow-up scheduling |
| Document Management | Upload, organize, and manage patient documents, referral letters, and reports |
| Insurance Pre-Authorization | Submit and track insurance pre-authorization requests |
| Billing Support | Assist with invoice generation, payment tracking, and insurance claims submission |
| Prescription Management (Limited) | Print and dispatch doctor-issued prescriptions; no prescribing authority |
| Referral Coordination | Coordinate specialist referrals; track referral status and follow-up scheduling |

### 2.2.6 Healthcare Provider — Pharmacy

Receive digital prescriptions, manage dispensing, and provide home delivery services.

| Feature | Description |
|---|---|
| Digital Prescription Inbox | Receive and manage incoming digital prescriptions from doctors |
| Prescription Verification | Verify prescription authenticity and patient identity via Emirates ID |
| Drug Inventory Management | Real-time inventory tracking with AI-driven demand forecasting and low-stock alerts |
| Dispensing Workflow | Step-by-step dispensing with AI interaction and allergy checks at point of dispensing |
| Patient Medication History | View patient's active medications (with consent) to check interactions before dispensing |
| Home Delivery Integration | Manage and track medication delivery orders |
| Refill Requests | Receive and process patient refill requests; notify prescribing doctor when authorization needed |
| Insurance Claims | Submit claims for covered medications; track reimbursement status |
| Analytics | Dispensing volume, revenue, top medications, and compliance metrics |

### 2.2.7 Healthcare Provider — Laboratory

Receive digital test orders, manage sample tracking, and deliver results directly into patient records.

| Feature | Description |
|---|---|
| Digital Test Order Inbox | Receive lab test orders from doctors with full clinical context |
| Sample Collection Management | Log sample collection with patient confirmation, sample ID, and collection time |
| Sample Status Tracking | Real-time status tracking from collection through processing to result delivery |
| Result Entry & Upload | Enter or upload lab results directly to the patient's health record |
| AI Result Flagging | AI flags abnormal results for priority notification to the ordering physician |
| Critical Value Alerts | Automatic immediate alerts to the ordering doctor for critical or panic values |
| Quality Control Records | Maintain QC logs and calibration records |
| Patient Result Delivery | Patients receive results with AI-assisted plain-language explanation |
| Insurance Billing Integration | Submit claims for performed tests; track insurance payment status |
| Analytics | Test volumes, turnaround times, abnormal rates, operational efficiency metrics |

---

## 2.3 Tier 3 — System & Platform Administration

### 2.3.1 CeenAiX Super Admin

Full platform access. Manages all entities, configurations, and compliance. Restricted to AryAiX internal staff.

| Feature | Description |
|---|---|
| User Management | Create, edit, suspend, and deactivate all user accounts across all roles |
| Healthcare Provider Onboarding | Approve, configure, and onboard clinics, hospitals, pharmacies, and laboratories |
| Insurance Package Management | Add, update, and manage insurance company packages |
| DHA Compliance Management | Monitor and enforce Dubai Health Authority regulatory compliance |
| AI Model Management | Monitor AI agent performance, update models, review flagged conversations, manage clinical validation |
| Platform Analytics & Reporting | Comprehensive analytics across all user types, clinical outcomes, and operational KPIs |
| Content Management | Manage health education content, articles, guides, and notification templates |
| Billing & Revenue Management | Platform-level revenue tracking, subscription management, financial reporting |
| Security & Audit Logs | Full audit trail; security monitoring and incident response |
| System Configuration | Feature flags, integration management, API configurations, platform settings |

### 2.3.2 Clinic / Hospital Admin

Local admin for each registered healthcare facility.

| Feature | Description |
|---|---|
| Staff Account Management | Create and manage accounts for doctors, nurses, assistants, and other staff |
| Department & Specialty Configuration | Define departments, specialties, and service offerings |
| Schedule & Resource Management | Configure rooms, equipment, and shared resources |
| Facility Analytics | Patient volumes, appointment metrics, revenue, staff performance reports |
| Insurance Configuration | Define accepted insurance plans and configure pre-authorization workflows |
| Billing Configuration | Set fee schedules, payment methods, and billing workflows |
| Compliance Management | Track DHA licensing status, maintain compliance documentation |

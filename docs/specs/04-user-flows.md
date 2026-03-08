# 4. Key User Flows

---

## 4.1 Guest User — AI Consultation to Account Creation

Primary conversion flow: guest → AI agent → registered account via appointment booking trigger.

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Guest | Visits CeenAiX website or opens app | — |
| 2 | Guest | Taps 'Talk to AI' — opens AI Health Agent chat | AI greets and asks how to help |
| 3 | Guest | Describes symptoms or health concern in natural language | AI conducts conversational symptom assessment |
| 4 | Guest (optional) | Uploads photo of lab result, prescription, or insurance card | AI reads and analyzes document |
| 5 | AI Agent | Summarizes likely concerns and recommends specialist type or specific doctor | AI explains reasoning and suggests next steps |
| 6 | Guest | Taps 'Book Appointment' with recommended doctor | AI confirms selection and initiates booking |
| 7 | Platform | Registration prompt: 'Create a free account to book your appointment' | AI explains benefits of creating an account |
| 8 | Guest → Patient | Registers with mobile number or Emirates ID; verifies OTP | AI pre-fills available data from chat session |
| 9 | New Patient | Confirms appointment booking; receives confirmation notification | AI sends pre-visit preparation instructions and pre-assessment questionnaire |
| 10 | Patient | Completes AI pre-visit assessment before appointment | AI generates structured pre-visit summary for the doctor |

---

## 4.2 Patient — Full Virtual Consultation Flow

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Patient | Logs into patient dashboard | AI surfaces health reminders and preparation tips |
| 2 | Patient | Completes AI pre-visit health assessment | AI conducts structured questionnaire; generates pre-visit summary |
| 3 | Patient | Enters virtual consultation waiting room | AI notifies doctor; shares pre-visit summary |
| 4 | Doctor | Reviews AI-generated pre-visit summary | AI flags key risk factors and prior conditions |
| 5 | Doctor + Patient | Virtual consultation begins (video/audio) | AI activates live session assistant — transcribes in real time |
| 6 | AI Agent | Analyses conversation and patient record simultaneously | AI proposes differential diagnoses and surfaces clinical guidelines |
| 7 | Doctor | Reviews AI suggestions in side panel; documents notes | AI auto-populates SOAP note template from conversation |
| 8 | Doctor | Issues digital prescription and/or lab orders | AI checks drug interactions; recommends investigations |
| 9 | Doctor | Ends consultation and submits clinical notes | AI finalizes transcription; stores in patient record |
| 10 | Patient | Receives post-visit summary, prescription, and follow-up instructions | AI explains next steps and medication instructions |
| 11 | Patient (optional) | Dispatches prescription to linked pharmacy | AI confirms pharmacy selection and estimated readiness |

---

## 4.3 Doctor — In-Person Consultation with AI Recording

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Nurse | Patient checks in; nurse records vitals and chief complaint | AI begins triage scoring; flags priority level |
| 2 | Doctor | Opens patient file on tablet or workstation | AI displays pre-visit summary, flagged risks, last visit notes |
| 3 | Doctor | Activates AI Recording — patient notified and gives consent | AI confirms consent recorded; begins real-time transcription |
| 4 | Doctor + Patient | Consultation proceeds naturally | AI transcribes, extracts symptoms, builds clinical picture |
| 5 | AI Agent | Displays live diagnosis suggestions and clinical alerts | AI surfaces differential diagnoses, guidelines, drug alerts |
| 6 | Doctor | Orders labs and imaging; AI pre-populates relevant tests | AI recommends investigations; flags duplicates |
| 7 | Doctor | Issues prescription using AI-assisted prescribing tool | AI checks interactions, dosing, and contraindications |
| 8 | Doctor | Ends session; reviews AI-generated SOAP note draft | AI generates complete structured clinical note |
| 9 | Doctor | Reviews, edits, approves, and signs off clinical note | AI stores note and transcript; removes audio per retention policy |
| 10 | Patient | Receives digital visit summary on patient app | AI explains diagnosis, treatment plan, and answers follow-up questions |

---

## 4.4 Family Member — Managing a Dependent's Health

| Step | Actor | Action |
|---|---|---|
| 1 | Family Member | Registers account and selects 'Family Manager' role |
| 2 | Family Member | Creates linked profile for dependent; uploads documents |
| 3 | Family Member | Uses AI Health Agent on behalf of dependent |
| 4 | Family Member | Books appointment for dependent |
| 5 | Family Member | Attends appointment or joins virtually as observer |
| 6 | Family Member | Receives lab results; AI explains in plain language |
| 7 | Family Member | Manages dependent's medications and reminders |
| 8 | Family Member | Adjusts sharing permissions for dependent's records |

---

## 4.5 Patient — Lab Result Analysis with AI

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Patient | Receives push notification: 'Your lab results are ready' | AI pre-screens for critical values; escalates if needed |
| 2 | Patient | Opens results — AI summary displayed first | AI provides plain-language interpretation |
| 3 | Patient (optional) | Uploads physical lab result photo via AI chat | AI reads via OCR; compares to previous results |
| 4 | AI Agent | Suggests next steps based on results | AI recommends follow-up, lifestyle changes, or referral |
| 5 | Patient | Asks AI follow-up questions about results | AI responds conversationally with clinical significance |
| 6 | Patient (optional) | Taps 'Share with Doctor' to flag for physician review | AI drafts message to doctor summarizing concern |

---

## 4.6 Patient — Standalone Registration

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Guest | Taps 'Register' or 'Create Account' on login page | — |
| 2 | Guest | Chooses method: email + OTP, mobile + OTP, or UAE Pass | — |
| 3 | Guest | Enters email or mobile; receives OTP | — |
| 4 | Guest | Enters OTP to verify identity | — |
| 5 | New Patient | Selects role: 'I am a Patient' (default) or 'I am a Healthcare Provider' | — |
| 6 | New Patient | Enters basic profile: full name, date of birth, gender | AI offers auto-fill from Emirates ID photo |
| 7 | New Patient | (Optional) Uploads Emirates ID photo | AI reads via OCR; extracts name, ID, DOB, nationality |
| 8 | New Patient | (Optional) Uploads insurance card photo | AI reads card; extracts provider, policy number, member ID |
| 9 | New Patient | Reviews pre-filled data, confirms profile | — |
| 10 | New Patient | Arrives at dashboard with welcome message and guided tour | AI introduces key features |

---

## 4.7 Healthcare Provider — Doctor Onboarding

| Step | Actor | Action | System / AI |
|---|---|---|---|
| 1 | Doctor | Selects 'Join as Healthcare Provider' on registration page | — |
| 2 | Doctor | Registers with email/mobile + OTP; selects role 'Doctor' | — |
| 3 | Doctor | Enters professional profile: specialization, experience | — |
| 4 | Doctor | Uploads DHA license document and Emirates ID | AI reads license number and Emirates ID via OCR |
| 5 | Platform | Submits license to DHA Salama API for verification | Automated verification; stored in doctor_profiles |
| 6 | Doctor | Selects facility affiliation or 'Independent Practice' | — |
| 7 | Doctor | Sets availability: days, hours, slot duration, fee | — |
| 8 | Doctor | Writes bio and uploads professional photo | — |
| 9 | Doctor | Submits application for review | Status: 'pending_review' |
| 10 | Super Admin | Reviews: DHA license, completeness, facility affiliation | Dashboard flags verification failures |
| 11 | Super Admin | Approves or requests additional information | Automated notification to doctor |
| 12 | Doctor | Receives approval; profile goes live | AI generates welcome and orientation |
| 13 | Doctor | Can now receive appointments and access clinical tools | — |

---

## 4.8 Nurse — Patient Triage and Vitals Recording

| Step | Actor | Action | AI Involvement |
|---|---|---|---|
| 1 | Nurse | Opens shift dashboard; sees today's queue | AI highlights flagged patients |
| 2 | Patient | Arrives; nurse selects from queue and taps 'Check In' | Status → 'checked_in' |
| 3 | Nurse | Records chief complaint in free text | AI assists with structured symptom tagging |
| 4 | Nurse | Records vitals: BP, HR, temp, SpO2, weight, height | AI calculates BMI; flags abnormals |
| 5 | AI | Displays triage severity score (ESI 1-5) | Recommends priority level |
| 6 | Nurse | Reviews and adjusts triage if appropriate | — |
| 7 | Nurse | Marks 'Ready for Doctor'; patient moves to doctor's queue | Doctor notified |
| 8 | Nurse | Records medication administration if due | AI flags missed or overdue doses |
| 9 | Nurse | Post-visit: receives follow-up tasks from doctor | AI populates task list from notes |

---

## 4.9 Pharmacy — Prescription Dispensing

| Step | Actor | Action | AI / System |
|---|---|---|---|
| 1 | System | New prescription arrives in pharmacy inbox | Push notification |
| 2 | Pharmacist | Reviews medication list, dosages, patient details | — |
| 3 | System | AI checks: drug interactions, allergy cross-check, dosage validation | Flags issues with severity |
| 4 | Pharmacist | Verifies prescription authenticity (doctor's digital signature) | System confirms license active |
| 5 | Pharmacist | Checks inventory for each item | AI shows stock status; suggests alternatives for out-of-stock |
| 6 | Pharmacist | Dispenses; marks items as 'dispensed' | Creates dispensing_records |
| 7 | Pharmacist | (Delivery) Creates delivery order | Triggers tracking; patient notified with ETA |
| 8 | Pharmacist | (Pickup) Notifies patient medication is ready | Push + SMS |
| 9 | Patient | Picks up or receives delivery; confirms receipt | Activates medication reminders |
| 10 | System | Submits insurance claim if applicable | Automated claim creation |

---

## 4.10 Laboratory — Order to Result Delivery

| Step | Actor | Action | AI / System |
|---|---|---|---|
| 1 | System | New lab order arrives from doctor | Push notification with clinical context |
| 2 | Lab Tech | Reviews order: tests, context, special instructions | — |
| 3 | Lab Tech | Verifies patient identity (Emirates ID / platform ID) | System confirms match |
| 4 | Lab Tech | Collects sample; logs sample ID, time, specimen type | Status → 'collected' |
| 5 | Lab Tech | Processes sample; status → 'processing' | — |
| 6 | Lab Tech | Enters or uploads results per test item | System validates format and units |
| 7 | System | AI screens results: flags abnormals, compares to prior | Assigns abnormality flags |
| 8 | System | For critical values: immediate alert to ordering doctor | Push + SMS with patient ID, test, result |
| 9 | Lab Tech | Reviews AI flags; confirms; marks 'resulted' | — |
| 10 | Doctor | Reviews results with AI interpretation context | AI highlights trends |
| 11 | Patient | Receives notification: 'Lab results are ready' | AI provides plain-language summary |
| 12 | System | Submits insurance claim if applicable | Automated |

---

## 4.11 Insurance Claims Submission

| Step | Actor | Action | System |
|---|---|---|---|
| 1 | System | Consultation completed; doctor finalizes notes | Creates insurance_claims record |
| 2 | System | Auto-populates: insurance details, ICD-10 codes, CPT codes, fee | AI maps diagnosis to ICD-10 codes |
| 3 | System | Validates completeness and coverage | Flags issues |
| 4 | Facility Admin | Reviews auto-generated claim; adds missing docs | — |
| 5 | System | Submits claim electronically | Status → 'submitted' |
| 6 | Insurance | Processes claim; returns approval/rejection | System receives via webhook |
| 7 | System | Updates status; notifies facility and patient | Rejection includes reason code |
| 8 | Patient | Views claim status in Insurance section | — |
| 9 | System | On approval: payment reconciled | Financial reports updated |

---

## 4.12 Super Admin — Provider Onboarding Approval

| Step | Actor | Action | System |
|---|---|---|---|
| 1 | System | New application in admin queue | Badge count shown |
| 2 | Super Admin | Reviews profile: name, specialization, facility, photo | — |
| 3 | Super Admin | Reviews DHA license verification (auto-verified via Salama) | Green = verified; Red = failed |
| 4 | Super Admin | Reviews Emirates ID verification | — |
| 5 | Super Admin | Checks facility affiliation | May trigger facility onboarding |
| 6 | Super Admin | Decision: Approve / Request More Info / Reject | — |
| 7a | (Approve) | Activates provider account; profile goes live | Approval email/SMS sent |
| 7b | (More Info) | Selects missing items | Provider notified with specifics |
| 7c | (Reject) | Selects reason | Provider receives rejection with appeal instructions |
| 8 | System | Audit log: admin, timestamp, action, application ID | Immutable |

---

## 4.13 Emergency Access via Emirates ID

| Step | Actor | Action | System |
|---|---|---|---|
| 1 | Emergency Responder | Opens CeenAiX Emergency Access portal (public, no login) | — |
| 2 | Emergency Responder | Enters patient's Emirates ID number | — |
| 3 | System | Verifies against registered patients | 'No profile found' if unregistered |
| 4 | System | Retrieves emergency profile: blood type, medications, allergies, conditions, emergency contact | Read-only; no full record access |
| 5 | Emergency Responder | Views critical health summary | — |
| 6 | System | Logs access: timestamp, Emirates ID, IP address | Patient notified of access |
| 7 | System | (Optional) Auto-notifies patient's emergency contact | SMS with timestamp |

**Security**: Rate-limited (10/IP/hour), opt-in only, emergency fields only, immutable audit log, abuse triggers security review.

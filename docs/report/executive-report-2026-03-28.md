# Executive Report

Date: 2026-03-28  
Project: CeenAiX  
Scope: UX refresh merge (Arabic/RTL), bilingual prescription display, locale numerals, public guest AI localization, and schema extensions for UAE-facing clinical copy

## Executive Summary

For the week of 2026-03-23, CeenAiX absorbed the approved **ideav2** visual system across public, auth, patient, and doctor surfaces while keeping **behavior and canonical data paths unchanged**. Arabic is now a first-class UI language with **RTL document layout**, shared chrome translated, and **Eastern Arabic–Indic numerals** applied to dashboard and prescription counts where the product already had English-only digits.

The platform also gained **database-backed bilingual vocabulary** for common prescription **frequency and duration** labels, plus an optional **Arabic medication display name** column that pairs with the canonical Latin/English INN on patient prescriptions and the patient dashboard. **Guest** `/ai-chat` is fully internationalized for shell copy and the opening assistant message; **clinicians** who open that route no longer see the patient “Find Doctors” call-to-action, with a clear path back to the **doctor portal**.

Schema documentation and checklist entries (**UX-1 through UX-14**) were updated to reflect this delivery; two Supabase migrations were added for `prescription_clinical_vocab`, `prescription_items.frequency_code` / `duration_code`, and `prescription_items.medication_name_ar`.

## What We Accomplished

### 1. Merged the ideav2 UX refresh without functional drift

- Reviewed external branch scope and recorded merge boundaries in `docs/ux/ideav2-merge-review.md` (UX-1, UX-8).
- Replaced the public **Home** experience with the approved layout while preserving routes and product behavior (UX-2).
- Refreshed **branding** (`favicon.svg`), **Header**, **Footer**, **AuthShell**, and portal **Navigation** to match the new system (UX-3).
- Restyled **public discovery** pages (`FindDoctor`, `FindClinic`, public `AIChat`, `HealthEducation`) and **auth** entry pages without changing auth logic (UX-4, UX-5).
- Applied the same visual language to **patient** and **doctor** portal shells and navigation (UX-6, UX-7).

### 2. Shipped Arabic localization and RTL foundation

- Integrated **i18next** with persisted language preference (`ceenaix.lang`) and merged locale resources (UX-9).
- Set **`lang`** and **`dir`** on the document root for Arabic vs English, and improved RTL-sensitive layout in shared chrome (UX-10).
- Added **Arabic strings** for shared navigation, footer, auth shell, and landing header patterns; expanded namespaces for public insurance content where wired (UX-11).
- Applied **Arabic-appropriate digit formatting** in i18n interpolation for numeric `{{count}}` values where the formatter applies (complements page-level `formatLocaleDigits`).

### 3. Bilingual prescriptions and medication display

- Introduced **`prescription_clinical_vocab`** (EN/AR labels, optional `legacy_match`, RLS for read + super_admin manage) and optional **`frequency_code` / `duration_code`** on `prescription_items`.
- Added **`medication_name_ar`** on `prescription_items` with seed backfill for common demo drug names; documented in `docs/agent/schema-reference.md`.
- Wired **patient dashboard** and **patient prescriptions** to resolve frequency/duration from vocab when codes or legacy text match, and to show **Arabic + canonical** medication lines via **`MedicationNameDisplay`** when the UI is non-English and Arabic text exists.

### 4. Locale numerals and readable mixed-language clinical UI

- Used **`formatLocaleDigits`** for high-visibility **counts** on patient **Prescriptions** stats, doctor **Dashboard** KPIs, and doctor **Appointments** list/calendar subtitles.
- For **Arabic UI**, wrapped **English patient-entered** chief complaint, notes, and pre-visit **AI summary** text in **`dir="ltr"`** so clinical prose remains readable inside RTL layout.

### 5. Public guest AI chat and clinician context

- Moved guest **`/ai-chat`** marketing and chrome strings into **`public.guestAiChat`** (English and Arabic); welcome message and chips follow **language changes** until the user starts a thread.
- When **`role === 'doctor'`**, hid the patient **“Find Doctors”** strip and replaced the signup promo with **clinician-oriented** copy and a link to **`/doctor/dashboard`**. Rule-based bot replies remain English until the public route is aligned with **AI-04** (Edge Function).

### 6. Engineering hygiene

- Fixed a corrupted markdown separator in **`CHECKLIST.md`** and appended **UX-12–UX-14** rows.
- Landed migrations in repo; remote database was brought forward via documented Supabase workflow where applicable.

## Business Impact

- The product presents a **coherent bilingual shell** aligned with UAE expectations: Arabic UI, RTL, and numerals where users scan counts and dates.
- **Prescription lines** can show **trusted Arabic labels** from the database alongside **canonical INN spelling**, supporting pharmacy alignment without pretending free-text drug names are machine-translated.
- **Doctors** see **appropriate** messaging on shared routes, reducing confusion between **patient acquisition** CTAs and **clinical workspace** entry points.
- **Schema and checklist** traceability improved for auditors and delivery planning (vocab table, new columns, UX checklist IDs).

## Details

| ID     | Item                                              | Status | Completed  | Notes                                                                                |
| ------ | ------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------ |
| UX-1   | Review external ideav2 branch for UX-only changes | done   | 2026-03-28 | `docs/ux/ideav2-merge-review.md`                                                     |
| UX-2   | Replace public landing with approved UX design    | done   | 2026-03-28 | `Home.tsx`; routes preserved                                                         |
| UX-3   | Shared branding + footer/header/auth chrome       | done   | 2026-03-28 | `favicon.svg`, `Header`, `Footer`, `AuthShell`, nav                                  |
| UX-4   | Restyle public discovery pages                    | done   | 2026-03-28 | `FindDoctor`, `FindClinic`, public `AIChat`, `HealthEducation`                       |
| UX-5   | Restyle auth pages                                | done   | 2026-03-28 | Auth flows unchanged                                                                 |
| UX-6   | Restyle patient portal                            | done   | 2026-03-28 | Shells + navigation                                                                  |
| UX-7   | Restyle doctor portal                             | done   | 2026-03-28 | Slate-emerald system                                                                 |
| UX-8   | Document external functionality not merged        | done   | 2026-03-28 | ideav2 merge review                                                                  |
| UX-9   | Arabic localization foundation                    | done   | 2026-03-28 | i18next, src/i18n, locales en/ar                                                                 |
| UX-10  | RTL support                                       | done   | 2026-03-28 | `documentElement` `lang`/`dir`, CSS font stack                                       |
| UX-11  | Arabic for shared/public chrome                   | done   | 2026-03-28 | Nav, footer, auth, landing header; namespaces grow incrementally                     |
| UX-12  | Prescription vocab + `medication_name_ar`         | done   | 2026-03-28 | Migrations + patient dashboard/prescriptions + `MedicationNameDisplay`               |
| UX-13  | Locale numerals + LTR clinical text               | done   | 2026-03-28 | Prescriptions stats, doctor dashboard, doctor appointments                           |
| UX-14  | Guest `/ai-chat` i18n + doctor chrome             | done   | 2026-03-28 | `public.guestAiChat`; hide patient CTA for doctors                                   |
| PAT-01 | Patient dashboard live data (related)             | done   | 2026-03-15 | Extended with vocab + `medication_name_ar` + `i18n.language` for dashboard med lines |



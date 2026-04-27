# Portal Parity Open Questions

## Patient Insurance

- Exact claims and pre-authorization records are not modeled in the current MVP schema. The patient insurance page now derives claim-style activity from appointments, lab orders, and prescriptions, but a future `insurance_claims` / `pre_authorizations` workflow is needed for insurer adjudication, denial reasons, EOB PDFs, turnaround times, and provider facility IDs.
- Medication, lab, and appointment prices are estimated in UI until pharmacy/lab/clinic price catalogs or insurer claim amounts are connected.

## Patient Documents

- There is no dedicated patient document metadata table yet. The Documents page now builds a vault from lab orders, prescriptions, and patient insurance rows, but uploaded PDFs, document tags, signed download URLs, sharing permissions, file sizes, page counts, and OCR/AI summaries need a persistent document model.

## Patient Imaging

- Patient Imaging currently uses radiology-style `lab_order_items` as the live source. True parity with the published DICOM viewer needs dedicated imaging study/report tables, storage for image series, accession metadata, radiologist report PDFs, and scoped sharing permissions.

## Patient Profile

- Core profile fields now load/save against `user_profiles`, `patient_profiles`, and `patient_insurance`, but family member/dependent profiles still need a canonical table before that section can persist beyond local UI state.

## Doctor Earnings

- Doctor Earnings now estimates revenue from completed appointments and `doctor_profiles.consultation_fee`. Exact parity with the published financial workspace requires billing/claims/payout/remittance tables for paid claims, pending insurer claims, tax exports, and payout history.

## Doctor Imaging

- Doctor Imaging now uses radiology-style `lab_order_items` assigned to the doctor. Full viewer/report parity requires the same dedicated imaging/DICOM model noted for patient imaging, plus radiologist workflow ownership and report sign-off data.

## Pharmacy Portal

- Pharmacy dashboard, dispensing, and inventory now derive live queue/inventory data from `prescriptions` and `prescription_items`. Exact parity still needs a pharmacy fulfillment model for assignment, verification steps, counseling timestamps, claim submission, inventory lots, expiry dates, and reorder thresholds.

## Lab Portal

- Lab dashboard/referrals/result entry already read live lab orders. The worklist is now scoped to the signed-in lab staff member's lab when `assigned_lab_id` is available. Full result-entry parity still needs UI forms wired to the existing lab RPCs for claim/start processing/save/release, plus result/release timestamps for accurate "completed today" metrics.


/*
  # Add Missing Foreign Key Indexes

  ## Performance Improvements
  
  This migration adds indexes to all foreign key columns that are currently unindexed.
  These indexes significantly improve query performance for JOIN operations and foreign key lookups.

  ## New Indexes
  
  1. activity_logs
    - idx_activity_logs_user_id on user_id
  
  2. appointment_types
    - idx_appointment_types_doctor_id on doctor_id
  
  3. audit_logs
    - idx_audit_logs_user_id on user_id
  
  4. consultation_notes
    - idx_consultation_notes_session_id on consultation_session_id
    - idx_consultation_notes_doctor_id on doctor_id
    - idx_consultation_notes_patient_id on patient_id
  
  5. doctor_availability
    - idx_doctor_availability_doctor_id on doctor_id
  
  6. fee_schedules
    - idx_fee_schedules_doctor_id on doctor_id
  
  7. health_scores
    - idx_health_scores_user_id on user_id
  
  8. insurance_claims
    - idx_insurance_claims_policy_id on insurance_policy_id
    - idx_insurance_claims_user_id on user_id
  
  9. insurance_policies
    - idx_insurance_policies_user_id on user_id
  
  10. linked_family_members
    - idx_linked_family_members_family_id on family_member_id
  
  11. medications
    - idx_medications_user_id on user_id
  
  12. pharmacy_orders
    - idx_pharmacy_orders_patient_id on patient_id
    - idx_pharmacy_orders_pharmacy_id on pharmacy_id
    - idx_pharmacy_orders_prescription_id on prescription_id
  
  13. prescription_items
    - idx_prescription_items_prescription_id on prescription_id
  
  14. symptom_logs
    - idx_symptom_logs_user_id on user_id
  
  15. vaccination_records
    - idx_vaccination_records_user_id on user_id
*/

/*
-- activity_logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- appointment_types indexes
CREATE INDEX IF NOT EXISTS idx_appointment_types_doctor_id ON appointment_types(doctor_id);

-- audit_logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- consultation_notes indexes
CREATE INDEX IF NOT EXISTS idx_consultation_notes_session_id ON consultation_notes(consultation_session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_doctor_id ON consultation_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_patient_id ON consultation_notes(patient_id);

-- doctor_availability indexes
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);

-- fee_schedules indexes
CREATE INDEX IF NOT EXISTS idx_fee_schedules_doctor_id ON fee_schedules(doctor_id);

-- health_scores indexes
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON health_scores(user_id);

-- insurance_claims indexes
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON insurance_claims(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user_id ON insurance_claims(user_id);

-- insurance_policies indexes
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON insurance_policies(user_id);

-- linked_family_members indexes
CREATE INDEX IF NOT EXISTS idx_linked_family_members_family_id ON linked_family_members(family_member_id);

-- medications indexes
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);

-- pharmacy_orders indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patient_id ON pharmacy_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy_id ON pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_prescription_id ON pharmacy_orders(prescription_id);

-- prescription_items indexes
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription_id ON prescription_items(prescription_id);

-- symptom_logs indexes
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);

-- vaccination_records indexes
CREATE INDEX IF NOT EXISTS idx_vaccination_records_user_id ON vaccination_records(user_id);
*/

-- Deprecated legacy migration retained for history only.
SELECT 1;

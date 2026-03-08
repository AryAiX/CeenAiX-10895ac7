/*
  # Add RLS Policies for Tables Without Policies

  ## Security Enhancement
  
  This migration adds comprehensive RLS policies for all tables that currently have RLS enabled but no policies.
  Following the principle of least privilege, all policies ensure users can only access their own data.

  ## New Policies Added For
  
  1. activity_logs - Users can view and create their own activity logs
  2. appointment_types - Doctors can manage their appointment types, patients can view
  3. audit_logs - Admin only access
  4. consultation_notes - Doctors and patients can view their consultation notes
  5. consultation_sessions - Doctors and patients can view their sessions
  6. doctor_availability - Doctors can manage, everyone can view
  7. emergency_access_profiles - Users can manage their own emergency profiles
  8. fee_schedules - Doctors can manage, everyone can view
  9. health_scores - Users can view their own health scores
  10. insurance_claims - Users can view and create their own claims
  11. insurance_policies - Users can manage their own policies
  12. medication_interactions - Read-only for authenticated users
  13. medications - Users can manage their own medications
  14. pharmacy_orders - Patients and pharmacies can view relevant orders
  15. prescription_items - Viewable by prescription owner
  16. symptom_logs - Users can manage their own symptom logs
  17. vaccination_records - Users can manage their own vaccination records
*/

/*
-- activity_logs policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- appointment_types policies
CREATE POLICY "Doctors can manage own appointment types"
  ON appointment_types FOR ALL
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

CREATE POLICY "All authenticated users can view appointment types"
  ON appointment_types FOR SELECT
  TO authenticated
  USING (true);

-- audit_logs policies
CREATE POLICY "Admin can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid())
      AND up.role = 'admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- consultation_notes policies
CREATE POLICY "Doctors can view own consultation notes"
  ON consultation_notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Patients can view own consultation notes"
  ON consultation_notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Doctors can create consultation notes"
  ON consultation_notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = doctor_id);

CREATE POLICY "Doctors can update own consultation notes"
  ON consultation_notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

-- consultation_sessions policies
CREATE POLICY "Doctors can view own consultation sessions"
  ON consultation_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Patients can view own consultation sessions"
  ON consultation_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Doctors can update own consultation sessions"
  ON consultation_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

-- doctor_availability policies
CREATE POLICY "Doctors can manage own availability"
  ON doctor_availability FOR ALL
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

CREATE POLICY "All authenticated users can view doctor availability"
  ON doctor_availability FOR SELECT
  TO authenticated
  USING (true);

-- emergency_access_profiles policies
CREATE POLICY "Users can view own emergency profile"
  ON emergency_access_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own emergency profile"
  ON emergency_access_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own emergency profile"
  ON emergency_access_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- fee_schedules policies
CREATE POLICY "Doctors can manage own fee schedules"
  ON fee_schedules FOR ALL
  TO authenticated
  USING ((select auth.uid()) = doctor_id)
  WITH CHECK ((select auth.uid()) = doctor_id);

CREATE POLICY "All authenticated users can view fee schedules"
  ON fee_schedules FOR SELECT
  TO authenticated
  USING (true);

-- health_scores policies
CREATE POLICY "Users can view own health scores"
  ON health_scores FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "System can create health scores"
  ON health_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- insurance_claims policies
CREATE POLICY "Users can view own insurance claims"
  ON insurance_claims FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own insurance claims"
  ON insurance_claims FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own insurance claims"
  ON insurance_claims FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- insurance_policies policies
CREATE POLICY "Users can view own insurance policies"
  ON insurance_policies FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own insurance policies"
  ON insurance_policies FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own insurance policies"
  ON insurance_policies FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- medication_interactions policies
CREATE POLICY "All authenticated users can view medication interactions"
  ON medication_interactions FOR SELECT
  TO authenticated
  USING (true);

-- medications policies
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- pharmacy_orders policies
CREATE POLICY "Patients can view own pharmacy orders"
  ON pharmacy_orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = patient_id);

CREATE POLICY "Pharmacies can view their orders"
  ON pharmacy_orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = pharmacy_id);

CREATE POLICY "Patients can create pharmacy orders"
  ON pharmacy_orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = patient_id);

CREATE POLICY "Pharmacies can update their orders"
  ON pharmacy_orders FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = pharmacy_id)
  WITH CHECK ((select auth.uid()) = pharmacy_id);

-- prescription_items policies
CREATE POLICY "Users can view prescription items for their prescriptions"
  ON prescription_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_items.prescription_id
      AND ((select auth.uid()) = p.patient_id OR (select auth.uid()) = p.doctor_id)
    )
  );

CREATE POLICY "Doctors can create prescription items"
  ON prescription_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_items.prescription_id
      AND (select auth.uid()) = p.doctor_id
    )
  );

-- symptom_logs policies
CREATE POLICY "Users can view own symptom logs"
  ON symptom_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own symptom logs"
  ON symptom_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- vaccination_records policies
CREATE POLICY "Users can view own vaccination records"
  ON vaccination_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own vaccination records"
  ON vaccination_records FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own vaccination records"
  ON vaccination_records FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own vaccination records"
  ON vaccination_records FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
*/

-- Deprecated legacy migration retained for history only.
SELECT 1;

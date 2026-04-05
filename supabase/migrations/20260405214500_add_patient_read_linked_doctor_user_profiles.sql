-- Allow patients to read linked doctor user profiles for appointment, prescription,
-- and messaging surfaces that show doctor identity.

DROP POLICY IF EXISTS "patients_read_linked_doctor_profiles" ON user_profiles;

CREATE POLICY "patients_read_linked_doctor_profiles" ON user_profiles
  FOR SELECT USING (
    role = 'doctor'
    AND (
      EXISTS (
        SELECT 1 FROM appointments
        WHERE appointments.patient_id = auth.uid()
          AND appointments.doctor_id = user_profiles.user_id
          AND appointments.is_deleted = false
      )
      OR EXISTS (
        SELECT 1 FROM prescriptions
        WHERE prescriptions.patient_id = auth.uid()
          AND prescriptions.doctor_id = user_profiles.user_id
          AND prescriptions.is_deleted = false
      )
      OR EXISTS (
        SELECT 1 FROM conversations
        WHERE (
          conversations.created_by = auth.uid()
          OR conversations.participant_ids ? auth.uid()::text
        )
          AND (
            conversations.created_by = user_profiles.user_id
            OR conversations.participant_ids ? user_profiles.user_id::text
          )
      )
    )
  );

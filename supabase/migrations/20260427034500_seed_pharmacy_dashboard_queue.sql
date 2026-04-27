-- Seed pharmacy dashboard data so the Bolt-parity pharmacy portal has enough
-- live prescription/inventory variety to validate all sections.

WITH target_patient AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'patient'
    AND (
      lower(coalesce(au.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'patient1@aryaix.com'
      OR lower(coalesce(up.full_name, '')) = 'patient 1'
    )
  LIMIT 1
),
target_doctor AS (
  SELECT up.user_id
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE up.role = 'doctor'
    AND (
      lower(coalesce(au.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.email, '')) = 'doctor2@aryaix.com'
      OR lower(coalesce(up.full_name, '')) IN ('doctor 2', 'dr. sarah al khateeb', 'dr. ahmed al rashidi')
    )
  LIMIT 1
),
seed_rows AS (
  SELECT *
  FROM (
    VALUES
      ('pharmacy_seed_rx_hold_atorvastatin', 'active'::prescription_status, now() - interval '5 minutes'),
      ('pharmacy_seed_rx_new_furosemide', 'active'::prescription_status, now() - interval '12 minutes'),
      ('pharmacy_seed_rx_new_bisoprolol', 'active'::prescription_status, now() - interval '18 minutes'),
      ('pharmacy_seed_rx_review_warfarin', 'completed'::prescription_status, now() - interval '27 minutes'),
      ('pharmacy_seed_rx_dispensed_metformin', 'completed'::prescription_status, now() - interval '2 hours'),
      ('pharmacy_seed_rx_dispensed_vitamin_d', 'completed'::prescription_status, now() - interval '35 minutes'),
      ('pharmacy_seed_rx_dispensed_amlodipine', 'completed'::prescription_status, now() - interval '42 minutes'),
      ('pharmacy_seed_rx_dispensed_losartan', 'completed'::prescription_status, now() - interval '48 minutes'),
      ('pharmacy_seed_rx_dispensed_omeprazole', 'completed'::prescription_status, now() - interval '55 minutes'),
      ('pharmacy_seed_rx_dispensed_rosuvastatin', 'completed'::prescription_status, now() - interval '63 minutes'),
      ('pharmacy_seed_rx_dispensed_paracetamol', 'completed'::prescription_status, now() - interval '74 minutes'),
      ('pharmacy_seed_rx_dispensed_aspirin', 'completed'::prescription_status, now() - interval '86 minutes')
  ) AS rows(seed_note, seed_status, seed_time)
),
seed_appointments AS (
  INSERT INTO public.appointments (
    patient_id,
    doctor_id,
    type,
    status,
    scheduled_at,
    duration_minutes,
    chief_complaint,
    notes,
    is_deleted
  )
  SELECT
    target_patient.user_id,
    target_doctor.user_id,
    'in_person',
    'completed',
    seed_rows.seed_time - interval '30 minutes',
    25,
    'Pharmacy dashboard seed prescription review',
    seed_rows.seed_note,
    false
  FROM target_patient
  CROSS JOIN target_doctor
  CROSS JOIN seed_rows
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.appointments existing_appointment
    WHERE existing_appointment.patient_id = target_patient.user_id
      AND existing_appointment.doctor_id = target_doctor.user_id
      AND existing_appointment.notes = seed_rows.seed_note
      AND existing_appointment.is_deleted = false
  )
  RETURNING id, notes
),
all_seed_appointments AS (
  SELECT id, notes
  FROM seed_appointments
  UNION
  SELECT appointments.id, appointments.notes
  FROM public.appointments appointments
  JOIN seed_rows ON seed_rows.seed_note = appointments.notes
  JOIN target_patient ON target_patient.user_id = appointments.patient_id
  JOIN target_doctor ON target_doctor.user_id = appointments.doctor_id
  WHERE appointments.is_deleted = false
),
inserted_prescriptions AS (
  INSERT INTO public.prescriptions (
    patient_id,
    doctor_id,
    appointment_id,
    status,
    prescribed_at,
    is_deleted
  )
  SELECT
    target_patient.user_id,
    target_doctor.user_id,
    all_seed_appointments.id,
    seed_rows.seed_status,
    seed_rows.seed_time,
    false
  FROM all_seed_appointments
  JOIN seed_rows ON seed_rows.seed_note = all_seed_appointments.notes
  CROSS JOIN target_patient
  CROSS JOIN target_doctor
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.prescriptions existing_prescription
    WHERE existing_prescription.appointment_id = all_seed_appointments.id
      AND existing_prescription.is_deleted = false
  )
  RETURNING id, appointment_id
),
all_seed_prescriptions AS (
  SELECT inserted_prescriptions.id, appointments.notes
  FROM inserted_prescriptions
  JOIN public.appointments appointments ON appointments.id = inserted_prescriptions.appointment_id
  UNION
  SELECT prescriptions.id, appointments.notes
  FROM public.prescriptions prescriptions
  JOIN public.appointments appointments ON appointments.id = prescriptions.appointment_id
  JOIN seed_rows ON seed_rows.seed_note = appointments.notes
  WHERE prescriptions.is_deleted = false
),
seed_items AS (
  SELECT *
  FROM (
    VALUES
      ('pharmacy_seed_rx_hold_atorvastatin', 'Atorvastatin', '20mg', 'Once nightly', '30 days', 0, false, 'Brand out of stock; generic substitution query required.'),
      ('pharmacy_seed_rx_new_furosemide', 'Furosemide', '60mg', 'Once daily, morning', '30 days', 30, false, 'Weigh daily and contact doctor for rapid gain.'),
      ('pharmacy_seed_rx_new_furosemide', 'Spironolactone', '25mg', 'Once daily', '30 days', 30, false, 'Take with food; monitor potassium.'),
      ('pharmacy_seed_rx_new_bisoprolol', 'Bisoprolol', '5mg', 'Once daily', '30 days', 8, false, 'Check pulse before dispensing counselling.'),
      ('pharmacy_seed_rx_review_warfarin', 'Warfarin', '5mg', 'Once daily', '30 days', 240, false, 'Batch expiring soon; verify INR counselling.'),
      ('pharmacy_seed_rx_dispensed_metformin', 'Metformin', '850mg', 'Twice daily', '30 days', 12, true, 'Take with meals.'),
      ('pharmacy_seed_rx_dispensed_vitamin_d', 'Vitamin D3', '2000 IU', 'Once daily', '30 days', 60, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_amlodipine', 'Amlodipine', '5mg', 'Once daily', '30 days', 30, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_losartan', 'Losartan', '50mg', 'Once daily', '30 days', 30, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_omeprazole', 'Omeprazole', '20mg', 'Once daily', '30 days', 30, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_rosuvastatin', 'Rosuvastatin', '10mg', 'Once daily', '30 days', 30, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_paracetamol', 'Paracetamol', '500mg', 'Once daily', '30 days', 48, true, 'Dispensed seed row for pharmacy dashboard parity.'),
      ('pharmacy_seed_rx_dispensed_aspirin', 'Aspirin', '81mg', 'Once daily', '30 days', 30, true, 'Dispensed seed row for pharmacy dashboard parity.')
  ) AS rows(seed_note, medication_name, dosage, frequency, duration, quantity, is_dispensed, instructions)
)
INSERT INTO public.prescription_items (
  prescription_id,
  medication_name,
  dosage,
  frequency,
  duration,
  quantity,
  instructions,
  is_dispensed
)
SELECT
  all_seed_prescriptions.id,
  seed_items.medication_name,
  seed_items.dosage,
  seed_items.frequency,
  seed_items.duration,
  seed_items.quantity,
  seed_items.instructions,
  seed_items.is_dispensed
FROM all_seed_prescriptions
JOIN seed_items ON seed_items.seed_note = all_seed_prescriptions.notes
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prescription_items existing_item
  WHERE existing_item.prescription_id = all_seed_prescriptions.id
    AND existing_item.medication_name = seed_items.medication_name
    AND coalesce(existing_item.dosage, '') = seed_items.dosage
);

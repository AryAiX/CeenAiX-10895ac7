/*
  # Update Sample Appointments Function
  
  1. Changes
    - Updates the `create_sample_appointments()` function to use actual doctors from the database
    - Creates realistic upcoming and past appointments with proper doctor references
    
  2. Features
    - Creates 3 upcoming appointments (mix of in-person and video)
    - Creates 3 past completed appointments
    - Adds ratings for completed appointments
    - All appointments are tagged with [DEMO] for easy cleanup
*/

CREATE OR REPLACE FUNCTION create_sample_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doctor_ids UUID[];
BEGIN
  -- Get actual doctor IDs from the database
  SELECT ARRAY_AGG(id) INTO doctor_ids
  FROM doctors
  LIMIT 6;

  -- Check if we have enough doctors
  IF ARRAY_LENGTH(doctor_ids, 1) < 6 THEN
    RAISE EXCEPTION 'Not enough doctors in the database. Please add at least 6 doctors first.';
  END IF;

  -- Delete any existing sample appointments for this user
  DELETE FROM appointments 
  WHERE user_id = auth.uid() 
  AND reason LIKE '%[DEMO]%';

  -- Insert upcoming appointments
  INSERT INTO appointments (
    user_id,
    doctor_id,
    appointment_date,
    appointment_time,
    type,
    location,
    latitude,
    longitude,
    reason,
    status
  )
  VALUES
    -- Upcoming appointment 1: In-person
    (
      auth.uid(),
      doctor_ids[1],
      CURRENT_DATE + INTERVAL '3 days',
      '10:00:00',
      'in-person',
      '123 Medical Plaza, New York, NY 10001',
      40.7506,
      -73.9935,
      'Annual Checkup - Full physical examination [DEMO]',
      'scheduled'
    ),
    -- Upcoming appointment 2: Video call
    (
      auth.uid(),
      doctor_ids[2],
      CURRENT_DATE + INTERVAL '6 days',
      '14:30:00',
      'video',
      'Video Consultation',
      NULL,
      NULL,
      'Follow-up: Blood pressure monitoring [DEMO]',
      'scheduled'
    ),
    -- Upcoming appointment 3: In-person
    (
      auth.uid(),
      doctor_ids[3],
      CURRENT_DATE + INTERVAL '10 days',
      '09:15:00',
      'in-person',
      '789 Wellness Ave, Manhattan, NY 10016',
      40.7459,
      -73.9796,
      'Skin consultation - Acne treatment review [DEMO]',
      'scheduled'
    ),
    -- Past appointment 1: Completed
    (
      auth.uid(),
      doctor_ids[4],
      CURRENT_DATE - INTERVAL '10 days',
      '11:00:00',
      'in-person',
      '321 Bone & Joint Clinic, Queens, NY 11354',
      40.7614,
      -73.8298,
      'Knee pain evaluation and X-ray [DEMO]',
      'completed'
    ),
    -- Past appointment 2: Completed
    (
      auth.uid(),
      doctor_ids[5],
      CURRENT_DATE - INTERVAL '15 days',
      '15:30:00',
      'in-person',
      '654 Family Medicine, Bronx, NY 10451',
      40.8209,
      -73.9249,
      'Flu symptoms and persistent cough [DEMO]',
      'completed'
    ),
    -- Past appointment 3: Completed video call
    (
      auth.uid(),
      doctor_ids[6],
      CURRENT_DATE - INTERVAL '32 days',
      '10:45:00',
      'video',
      'Video Consultation',
      NULL,
      NULL,
      'Heart health consultation and ECG review [DEMO]',
      'completed'
    );

  -- Add ratings for the completed appointments
  INSERT INTO doctor_ratings (
    user_id,
    doctor_id,
    appointment_id,
    rating
  )
  SELECT
    auth.uid(),
    doctor_id,
    id,
    CASE 
      WHEN random() < 0.7 THEN 5
      WHEN random() < 0.9 THEN 4
      ELSE 3
    END
  FROM appointments
  WHERE user_id = auth.uid()
  AND status = 'completed'
  AND reason LIKE '%[DEMO]%'
  ON CONFLICT (user_id, appointment_id) DO NOTHING;
END;
$$;

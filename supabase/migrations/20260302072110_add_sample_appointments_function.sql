/*
  # Add Sample Appointments Function

  1. New Functions
    - `create_sample_appointments()` - Creates sample upcoming and past appointments for the authenticated user
    - Can be called from the frontend to populate demo data

  2. Purpose
    - Demonstrates the appointment system with realistic data
    - Creates 3 upcoming appointments (in-person and video)
    - Creates 3 past completed appointments
    - Adds ratings for some completed appointments

  3. Usage
    - Call from frontend: `supabase.rpc('create_sample_appointments')`
*/

CREATE OR REPLACE FUNCTION create_sample_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    -- Upcoming appointment 1: In-person with Dr. Sarah Ahmed
    (
      auth.uid(),
      'd1111111-1111-1111-1111-111111111111',
      CURRENT_DATE + INTERVAL '3 days',
      '10:00:00',
      'in-person',
      'Dubai Healthcare City, Building 27',
      25.1172,
      55.2082,
      'Annual Checkup - Full physical examination [DEMO]',
      'scheduled'
    ),
    -- Upcoming appointment 2: Video call with Dr. Mohammed Hassan
    (
      auth.uid(),
      'd2222222-2222-2222-2222-222222222222',
      CURRENT_DATE + INTERVAL '6 days',
      '14:30:00',
      'video',
      'Video Consultation',
      NULL,
      NULL,
      'Follow-up: Blood pressure monitoring [DEMO]',
      'scheduled'
    ),
    -- Upcoming appointment 3: In-person with Dr. Fatima Al-Rashid
    (
      auth.uid(),
      'd3333333-3333-3333-3333-333333333333',
      CURRENT_DATE + INTERVAL '10 days',
      '09:15:00',
      'in-person',
      'Mediclinic City Hospital',
      25.1280,
      55.2090,
      'Skin consultation - Acne treatment review [DEMO]',
      'scheduled'
    ),
    -- Past appointment 1: Completed with Dr. Ahmed Khalil
    (
      auth.uid(),
      'd4444444-4444-4444-4444-444444444444',
      CURRENT_DATE - INTERVAL '10 days',
      '11:00:00',
      'in-person',
      'NMC Royal Hospital',
      25.2244,
      55.2819,
      'Knee pain evaluation and X-ray [DEMO]',
      'completed'
    ),
    -- Past appointment 2: Completed with Dr. Sarah Ahmed
    (
      auth.uid(),
      'd1111111-1111-1111-1111-111111111111',
      CURRENT_DATE - INTERVAL '15 days',
      '15:30:00',
      'in-person',
      'Dubai Healthcare City, Building 27',
      25.1172,
      55.2082,
      'Flu symptoms and persistent cough [DEMO]',
      'completed'
    ),
    -- Past appointment 3: Completed video call with Dr. Mohammed Hassan
    (
      auth.uid(),
      'd2222222-2222-2222-2222-222222222222',
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
      WHEN doctor_id = 'd4444444-4444-4444-4444-444444444444' THEN 5
      WHEN doctor_id = 'd1111111-1111-1111-1111-111111111111' THEN 5
      ELSE 4
    END
  FROM appointments
  WHERE user_id = auth.uid()
  AND status = 'completed'
  AND reason LIKE '%[DEMO]%'
  ON CONFLICT (user_id, appointment_id) DO NOTHING;
END;
$$;

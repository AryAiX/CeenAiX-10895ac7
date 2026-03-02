/*
  # Create Upcoming Appointments Function

  1. New Functions
    - `create_upcoming_appointments()` - Creates 2 upcoming appointments for the current user
      - Returns the created appointments
      - One in-person appointment in 3 days at 10:30 AM
      - One video appointment in 7 days at 2:00 PM

  2. Security
    - Function is SECURITY DEFINER to bypass RLS temporarily during creation
    - Only authenticated users can call this function
*/

CREATE OR REPLACE FUNCTION create_upcoming_appointments()
RETURNS TABLE (
  id uuid,
  appointment_date date,
  appointment_time time,
  type text,
  reason text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_doctor_1 uuid;
  v_doctor_2 uuid;
  v_location_1 text;
  v_lat_1 numeric;
  v_lon_1 numeric;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM appointments 
  WHERE user_id = v_user_id 
  AND status = 'scheduled' 
  AND appointment_date >= CURRENT_DATE;

  SELECT d.id, d.location, d.latitude, d.longitude
  INTO v_doctor_1, v_location_1, v_lat_1, v_lon_1
  FROM doctors d
  ORDER BY RANDOM()
  LIMIT 1;

  SELECT d.id
  INTO v_doctor_2
  FROM doctors d
  WHERE d.id != v_doctor_1
  ORDER BY RANDOM()
  LIMIT 1;

  RETURN QUERY
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
    (
      v_user_id,
      v_doctor_1,
      CURRENT_DATE + INTERVAL '3 days',
      '10:30:00'::time,
      'in-person',
      v_location_1,
      v_lat_1,
      v_lon_1,
      'Annual Physical Examination',
      'scheduled'
    ),
    (
      v_user_id,
      v_doctor_2,
      CURRENT_DATE + INTERVAL '7 days',
      '14:00:00'::time,
      'video',
      'Video Consultation',
      NULL,
      NULL,
      'Follow-up Consultation',
      'scheduled'
    )
  RETURNING 
    appointments.id,
    appointments.appointment_date,
    appointments.appointment_time,
    appointments.type,
    appointments.reason;
END;
$$;

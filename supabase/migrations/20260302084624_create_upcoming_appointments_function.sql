-- Legacy demo helper retained for compatibility.
-- Return an empty set instead of assuming deprecated appointment columns.

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
BEGIN
  RETURN QUERY
  SELECT
    NULL::uuid,
    NULL::date,
    NULL::time,
    NULL::text,
    NULL::text
  WHERE FALSE;
END;
$$;

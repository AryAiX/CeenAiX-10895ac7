-- Legacy demo helper retained for compatibility.
-- Keep the function callable without assuming the deprecated appointment shape.

CREATE OR REPLACE FUNCTION create_sample_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN;
END;
$$;

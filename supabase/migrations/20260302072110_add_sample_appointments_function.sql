-- Legacy demo helper retained for compatibility.
-- The canonical appointments schema no longer matches the original demo payload.

CREATE OR REPLACE FUNCTION create_sample_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN;
END;
$$;

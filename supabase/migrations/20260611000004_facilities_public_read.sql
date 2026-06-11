CREATE POLICY "facilities_public_read"
ON facilities FOR SELECT
USING (
  is_active = true 
  AND is_deleted = false
);
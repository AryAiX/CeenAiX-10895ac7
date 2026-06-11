-- Link existing appointments to Al Noor Family Clinic facility
-- for doctors that are part of this facility
UPDATE appointments
SET facility_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE facility_id IS NULL
AND doctor_id IN (
  SELECT doctor_user_id 
  FROM facility_staff 
  WHERE facility_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND is_active = true
)
AND is_deleted = false;
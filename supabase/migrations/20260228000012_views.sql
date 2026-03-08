-- Convenience views for backward compatibility with Bolt UI code
-- These map the spec schema to the flat structure Bolt components expect

CREATE OR REPLACE VIEW doctors_view AS
SELECT
  dp.id,
  dp.user_id,
  up.full_name AS name,
  dp.specialization AS specialty,
  up.city AS location,
  up.avatar_url AS image_url,
  dp.consultation_fee,
  dp.bio,
  dp.years_of_experience,
  dp.languages_spoken,
  dp.license_number,
  dp.dha_license_verified
FROM doctor_profiles dp
JOIN user_profiles up ON up.user_id = dp.user_id;

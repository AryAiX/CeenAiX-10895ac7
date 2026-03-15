-- Backfill canonical doctor_specializations rows from existing doctor_profiles
-- primary and sub-specialization text fields. This is safe to rerun.

WITH raw_specialization_values AS (
  SELECT
    dp.user_id AS doctor_user_id,
    trim(split_value) AS specialization_name
  FROM public.doctor_profiles dp
  CROSS JOIN LATERAL unnest(
    string_to_array(
      concat_ws(
        ',',
        nullif(dp.specialization, ''),
        nullif(dp.sub_specialization, '')
      ),
      ','
    )
  ) AS split_value
),
matched_specializations AS (
  SELECT DISTINCT
    raw_specialization_values.doctor_user_id,
    specializations.id AS specialization_id
  FROM raw_specialization_values
  JOIN public.specializations
    ON lower(raw_specialization_values.specialization_name) = lower(specializations.name)
  WHERE raw_specialization_values.specialization_name <> ''
)
INSERT INTO public.doctor_specializations (doctor_user_id, specialization_id)
SELECT doctor_user_id, specialization_id
FROM matched_specializations
ON CONFLICT (doctor_user_id, specialization_id) DO NOTHING;

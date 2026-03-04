/*
  # Add More Sample Doctors

  1. Changes
    - Insert additional sample doctors with diverse names and specialties
    - Includes various medical specialties
    - Mix of doctors who accept video consultations and those who don't

  2. Data
    - 12 new doctors with different specialties
    - Random availability slots
    - Different locations across healthcare facilities
*/

INSERT INTO doctors (name, specialty, location, latitude, longitude, image_url, available_slots, accepts_video)
VALUES
  ('Dr. Priya Sharma', 'Pediatrics', 'Aster Hospital', 25.1950, 55.2744, 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200', 10, true),
  ('Dr. Omar Al-Mansouri', 'Neurology', 'Mediclinic Parkview', 25.1120, 55.1980, 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200', 5, true),
  ('Dr. Jennifer Wong', 'Gynecology', 'Burjeel Hospital', 25.1872, 55.2674, 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=200', 14, false),
  ('Dr. Youssef Ibrahim', 'Ophthalmology', 'Moorfields Eye Hospital', 25.1210, 55.2120, 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200', 9, true),
  ('Dr. Marina Ivanova', 'Psychiatry', 'American Hospital Dubai', 25.1345, 55.1889, 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=200', 7, true),
  ('Dr. Rajesh Patel', 'Gastroenterology', 'Emirates Hospital', 25.2650, 55.3095, 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=200', 11, false),
  ('Dr. Layla Hassan', 'Endocrinology', 'Saudi German Hospital', 25.2156, 55.2790, 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=200', 13, true),
  ('Dr. Michael Chen', 'Pulmonology', 'Rashid Hospital', 25.2531, 55.3236, 'https://images.pexels.com/photos/6627362/pexels-photo-6627362.jpeg?auto=compress&cs=tinysrgb&w=200', 8, true),
  ('Dr. Aisha Al-Zaabi', 'Rheumatology', 'Cleveland Clinic Abu Dhabi', 24.5247, 54.4343, 'https://images.pexels.com/photos/8460064/pexels-photo-8460064.jpeg?auto=compress&cs=tinysrgb&w=200', 6, false),
  ('Dr. Carlos Rodriguez', 'Urology', 'Zulekha Hospital', 25.3547, 55.3889, 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=200', 12, true),
  ('Dr. Nadia Malik', 'Allergy & Immunology', 'Prime Hospital', 25.0657, 55.1421, 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200', 15, true),
  ('Dr. Hassan Farooq', 'Oncology', 'Mediclinic City Hospital', 25.1280, 55.2090, 'https://images.pexels.com/photos/7447015/pexels-photo-7447015.jpeg?auto=compress&cs=tinysrgb&w=200', 4, false)
ON CONFLICT DO NOTHING;

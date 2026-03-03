/*
  # Add Sample Hospitals and Clinics Data

  1. Sample Data
    - Insert 8 hospitals and clinics across Dubai
    - Link existing doctors to hospitals
    - Add realistic facilities, specialties, and operating hours
*/

-- Insert sample hospitals and clinics
INSERT INTO hospitals (name, type, address, city, phone, email, image_url, rating, total_reviews, description, facilities, specialties, emergency_services, parking_available, insurance_accepted, operating_hours, latitude, longitude)
VALUES
  (
    'Dubai Health Authority - Al Barsha',
    'hospital',
    'Al Barsha South, Dubai',
    'Dubai',
    '+971-4-219-3000',
    'info@dha.barsha.ae',
    'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg',
    4.6,
    892,
    'State-of-the-art multi-specialty hospital with 24/7 emergency services. Equipped with the latest medical technology and staffed by internationally trained healthcare professionals.',
    '["Emergency Department", "ICU", "Operating Theaters", "Laboratory", "Radiology", "Pharmacy", "Cafeteria", "Prayer Room", "Free WiFi"]'::jsonb,
    '["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "General Surgery", "Internal Medicine"]'::jsonb,
    true,
    true,
    '["Dubai Health Insurance", "DAMAN", "AXA", "BUPA", "MetLife"]'::jsonb,
    '{"monday": "24 Hours", "tuesday": "24 Hours", "wednesday": "24 Hours", "thursday": "24 Hours", "friday": "24 Hours", "saturday": "24 Hours", "sunday": "24 Hours"}'::jsonb,
    25.0959,
    55.1968
  ),
  (
    'Mediclinic City Hospital',
    'hospital',
    'Dubai Healthcare City, Dubai',
    'Dubai',
    '+971-4-435-9999',
    'contact@mediclinic.ae',
    'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg',
    4.8,
    1247,
    'Premium healthcare facility in Dubai Healthcare City offering comprehensive medical services with international accreditation. Features advanced diagnostic equipment and world-class specialists.',
    '["24/7 Emergency", "NICU", "Cardiac Cath Lab", "MRI & CT Scan", "Maternity Ward", "Pediatric Ward", "VIP Rooms", "Parking"]'::jsonb,
    '["Cardiology", "Oncology", "Neurosurgery", "Obstetrics", "Plastic Surgery", "Dermatology"]'::jsonb,
    true,
    true,
    '["DAMAN", "AXA", "Allianz", "MetLife", "Cigna", "BUPA"]'::jsonb,
    '{"monday": "24 Hours", "tuesday": "24 Hours", "wednesday": "24 Hours", "thursday": "24 Hours", "friday": "24 Hours", "saturday": "24 Hours", "sunday": "24 Hours"}'::jsonb,
    25.2201,
    55.3089
  ),
  (
    'Prime Medical Center',
    'clinic',
    'Jumeirah Beach Residence (JBR), Dubai',
    'Dubai',
    '+971-4-399-9590',
    'jbr@primemedical.ae',
    'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
    4.5,
    534,
    'Modern medical clinic in JBR offering general practice, specialist consultations, and diagnostic services. Convenient location with easy parking and extended hours.',
    '["X-Ray", "Laboratory", "Pharmacy", "Dental Clinic", "Physiotherapy", "Free Parking", "Wheelchair Access"]'::jsonb,
    '["General Practice", "Dermatology", "Dentistry", "Physiotherapy", "Pediatrics"]'::jsonb,
    false,
    true,
    '["DAMAN", "AXA", "MetLife", "BUPA"]'::jsonb,
    '{"monday": "8:00 AM - 10:00 PM", "tuesday": "8:00 AM - 10:00 PM", "wednesday": "8:00 AM - 10:00 PM", "thursday": "8:00 AM - 10:00 PM", "friday": "2:00 PM - 10:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "8:00 AM - 10:00 PM"}'::jsonb,
    25.0769,
    55.1354
  ),
  (
    'American Hospital Dubai',
    'hospital',
    'Oud Metha, Dubai',
    'Dubai',
    '+971-4-336-7777',
    'info@ahdubai.com',
    'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg',
    4.7,
    1583,
    'Leading private hospital in the Middle East with JCI accreditation. Offers comprehensive healthcare services with American-trained physicians and cutting-edge medical technology.',
    '["Emergency Room", "ICU & CCU", "Operating Rooms", "Labor & Delivery", "Diagnostic Imaging", "Laboratory", "Pharmacy", "Valet Parking"]'::jsonb,
    '["Cardiology", "Orthopedics", "Gastroenterology", "Neurology", "Oncology", "Pediatrics", "Women Health"]'::jsonb,
    true,
    true,
    '["DAMAN", "AXA", "Allianz", "BUPA", "MetLife", "Cigna", "GlobeMed"]'::jsonb,
    '{"monday": "24 Hours", "tuesday": "24 Hours", "wednesday": "24 Hours", "thursday": "24 Hours", "friday": "24 Hours", "saturday": "24 Hours", "sunday": "24 Hours"}'::jsonb,
    25.2360,
    55.3124
  ),
  (
    'Dubai London Clinic',
    'clinic',
    'Al Wasl Road, Jumeirah, Dubai',
    'Dubai',
    '+971-4-344-6663',
    'reception@dubailondonclinic.com',
    'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
    4.4,
    678,
    'Boutique medical clinic offering personalized healthcare with British-trained specialists. Focus on preventive medicine and family health in a comfortable environment.',
    '["GP Clinic", "Specialist Consultations", "Laboratory", "Minor Procedures Room", "Vaccination Center", "Free Parking"]'::jsonb,
    '["General Practice", "Internal Medicine", "Pediatrics", "Women Health", "Dermatology"]'::jsonb,
    false,
    true,
    '["AXA", "BUPA", "MetLife", "Allianz"]'::jsonb,
    '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "Closed", "saturday": "9:00 AM - 5:00 PM", "sunday": "9:00 AM - 5:00 PM"}'::jsonb,
    25.2205,
    55.2573
  ),
  (
    'Aster Hospital - Mankhool',
    'hospital',
    'Mankhool Road, Bur Dubai',
    'Dubai',
    '+971-4-378-6666',
    'info@asterhospital.ae',
    'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg',
    4.5,
    945,
    'Multi-specialty hospital providing quality healthcare at affordable prices. Part of the renowned Aster DM Healthcare network with a focus on patient care and comfort.',
    '["24/7 Emergency", "ICU", "NICU", "Operating Theaters", "Dialysis Unit", "Pharmacy", "Laboratory", "Radiology", "Cafeteria"]'::jsonb,
    '["Internal Medicine", "General Surgery", "Orthopedics", "Gynecology", "Pediatrics", "ENT", "Ophthalmology"]'::jsonb,
    true,
    true,
    '["DAMAN", "Neuron", "MetLife", "AXA", "Oman Insurance"]'::jsonb,
    '{"monday": "24 Hours", "tuesday": "24 Hours", "wednesday": "24 Hours", "thursday": "24 Hours", "friday": "24 Hours", "saturday": "24 Hours", "sunday": "24 Hours"}'::jsonb,
    25.2532,
    55.2967
  ),
  (
    'NMC Royal Hospital',
    'hospital',
    'Khalifa City, Abu Dhabi',
    'Abu Dhabi',
    '+971-2-446-6333',
    'royal@nmc.ae',
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
    4.6,
    1156,
    'State-of-the-art hospital in Abu Dhabi offering world-class medical care. Features advanced facilities and a team of highly qualified international medical professionals.',
    '["Emergency Department", "ICU", "Cardiac Center", "Women & Children Hospital", "Imaging Center", "Laboratory", "Pharmacy", "Free Parking"]'::jsonb,
    '["Cardiology", "Neurology", "Orthopedics", "Obstetrics & Gynecology", "Pediatrics", "General Surgery"]'::jsonb,
    true,
    true,
    '["DAMAN", "Thiqa", "AXA", "MetLife", "BUPA"]'::jsonb,
    '{"monday": "24 Hours", "tuesday": "24 Hours", "wednesday": "24 Hours", "thursday": "24 Hours", "friday": "24 Hours", "saturday": "24 Hours", "sunday": "24 Hours"}'::jsonb,
    24.4189,
    54.5986
  ),
  (
    'Medcare Medical Centre - Marina',
    'clinic',
    'Dubai Marina, Dubai',
    'Dubai',
    '+971-4-436-1200',
    'marina@medcare.ae',
    'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg',
    4.3,
    423,
    'Conveniently located medical center in Dubai Marina offering comprehensive outpatient services. Modern facility with experienced doctors and state-of-the-art diagnostic equipment.',
    '["GP Services", "Specialist Consultations", "Diagnostic Laboratory", "Digital X-Ray", "Pharmacy", "Physiotherapy", "Parking"]'::jsonb,
    '["General Practice", "Internal Medicine", "Orthopedics", "Dermatology", "Pediatrics"]'::jsonb,
    false,
    true,
    '["DAMAN", "AXA", "MetLife", "Neuron"]'::jsonb,
    '{"monday": "8:00 AM - 9:00 PM", "tuesday": "8:00 AM - 9:00 PM", "wednesday": "8:00 AM - 9:00 PM", "thursday": "8:00 AM - 9:00 PM", "friday": "2:00 PM - 9:00 PM", "saturday": "8:00 AM - 9:00 PM", "sunday": "8:00 AM - 9:00 PM"}'::jsonb,
    25.0805,
    55.1398
  );

-- Link doctors to hospitals (using existing sample doctors)
DO $$
DECLARE
  hospital_dha uuid;
  hospital_mediclinic uuid;
  hospital_american uuid;
  hospital_aster uuid;
  hospital_nmc uuid;
  clinic_prime uuid;
  clinic_london uuid;
  clinic_medcare uuid;
  doctor_ids uuid[];
BEGIN
  -- Get hospital IDs
  SELECT id INTO hospital_dha FROM hospitals WHERE name = 'Dubai Health Authority - Al Barsha';
  SELECT id INTO hospital_mediclinic FROM hospitals WHERE name = 'Mediclinic City Hospital';
  SELECT id INTO hospital_american FROM hospitals WHERE name = 'American Hospital Dubai';
  SELECT id INTO hospital_aster FROM hospitals WHERE name = 'Aster Hospital - Mankhool';
  SELECT id INTO hospital_nmc FROM hospitals WHERE name = 'NMC Royal Hospital';
  SELECT id INTO clinic_prime FROM hospitals WHERE name = 'Prime Medical Center';
  SELECT id INTO clinic_london FROM hospitals WHERE name = 'Dubai London Clinic';
  SELECT id INTO clinic_medcare FROM hospitals WHERE name = 'Medcare Medical Centre - Marina';

  -- Get some doctor IDs
  SELECT ARRAY(SELECT id FROM doctors LIMIT 20) INTO doctor_ids;

  -- Link doctors to hospitals (distribute doctors across facilities)
  IF array_length(doctor_ids, 1) >= 20 THEN
    -- DHA Hospital
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (hospital_dha, doctor_ids[1], true, '["Monday", "Tuesday", "Wednesday", "Thursday"]'::jsonb, '9:00 AM - 5:00 PM', '201'),
      (hospital_dha, doctor_ids[2], true, '["Sunday", "Monday", "Wednesday", "Friday"]'::jsonb, '8:00 AM - 4:00 PM', '203'),
      (hospital_dha, doctor_ids[3], true, '["Tuesday", "Thursday", "Saturday"]'::jsonb, '10:00 AM - 6:00 PM', '205')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- Mediclinic
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (hospital_mediclinic, doctor_ids[4], true, '["Monday", "Wednesday", "Thursday"]'::jsonb, '9:00 AM - 5:00 PM', '301'),
      (hospital_mediclinic, doctor_ids[5], true, '["Sunday", "Tuesday", "Thursday"]'::jsonb, '8:00 AM - 3:00 PM', '302'),
      (hospital_mediclinic, doctor_ids[6], false, '["Monday", "Tuesday"]'::jsonb, '10:00 AM - 4:00 PM', '304')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- American Hospital
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (hospital_american, doctor_ids[7], true, '["Monday", "Tuesday", "Wednesday"]'::jsonb, '9:00 AM - 6:00 PM', '401'),
      (hospital_american, doctor_ids[8], true, '["Sunday", "Monday", "Wednesday", "Friday"]'::jsonb, '8:00 AM - 4:00 PM', '403'),
      (hospital_american, doctor_ids[9], true, '["Tuesday", "Thursday", "Saturday"]'::jsonb, '10:00 AM - 5:00 PM', '405')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- Aster Hospital
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (hospital_aster, doctor_ids[10], true, '["Sunday", "Monday", "Tuesday", "Wednesday"]'::jsonb, '9:00 AM - 5:00 PM', '501'),
      (hospital_aster, doctor_ids[11], true, '["Monday", "Wednesday", "Friday"]'::jsonb, '8:00 AM - 2:00 PM', '502')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- NMC Royal
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (hospital_nmc, doctor_ids[12], true, '["Sunday", "Tuesday", "Thursday"]'::jsonb, '9:00 AM - 5:00 PM', 'A-201'),
      (hospital_nmc, doctor_ids[13], true, '["Monday", "Wednesday", "Friday"]'::jsonb, '10:00 AM - 6:00 PM', 'A-203')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- Prime Medical Center
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (clinic_prime, doctor_ids[14], true, '["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]'::jsonb, '9:00 AM - 8:00 PM', 'C1'),
      (clinic_prime, doctor_ids[15], true, '["Monday", "Wednesday", "Saturday"]'::jsonb, '10:00 AM - 7:00 PM', 'C2')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- Dubai London Clinic
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (clinic_london, doctor_ids[16], true, '["Sunday", "Monday", "Tuesday", "Thursday"]'::jsonb, '8:00 AM - 6:00 PM', 'R1'),
      (clinic_london, doctor_ids[17], true, '["Monday", "Wednesday", "Saturday"]'::jsonb, '9:00 AM - 5:00 PM', 'R2')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;

    -- Medcare Marina
    INSERT INTO hospital_doctors (hospital_id, doctor_id, is_available, consultation_days, consultation_hours, room_number)
    VALUES 
      (clinic_medcare, doctor_ids[18], true, '["Sunday", "Tuesday", "Wednesday", "Thursday"]'::jsonb, '8:00 AM - 7:00 PM', 'M101'),
      (clinic_medcare, doctor_ids[19], true, '["Monday", "Wednesday", "Friday", "Saturday"]'::jsonb, '9:00 AM - 8:00 PM', 'M102'),
      (clinic_medcare, doctor_ids[20], false, '["Tuesday", "Thursday"]'::jsonb, '10:00 AM - 4:00 PM', 'M103')
    ON CONFLICT (hospital_id, doctor_id) DO NOTHING;
  END IF;
END $$;
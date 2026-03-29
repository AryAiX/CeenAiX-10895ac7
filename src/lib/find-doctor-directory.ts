import type { TFunction } from 'i18next';

/** Maps exact `doctors.name` from seed data → `findDoctor.displayNames.*` key */
export const DOCTOR_DISPLAY_NAME_KEY: Record<string, string> = {
  'Dr. Sarah Ahmed': 'drSarahAhmed',
  'Dr. Mohammed Hassan': 'drMohammedHassan',
  'Dr. Fatima Al-Rashid': 'drFatimaAlRashid',
  'Dr. Ahmed Khalil': 'drAhmedKhalil',
  'Dr. Priya Sharma': 'drPriyaSharma',
  'Dr. Omar Al-Mansouri': 'drOmarAlMansouri',
  'Dr. Jennifer Wong': 'drJenniferWong',
  'Dr. Youssef Ibrahim': 'drYoussefIbrahim',
  'Dr. Marina Ivanova': 'drMarinaIvanova',
  'Dr. Rajesh Patel': 'drRajeshPatel',
  'Dr. Layla Hassan': 'drLaylaHassan',
  'Dr. Michael Chen': 'drMichaelChen',
  'Dr. Aisha Al-Zaabi': 'drAishaAlZaabi',
  'Dr. Carlos Rodriguez': 'drCarlosRodriguez',
  'Dr. Nadia Malik': 'drNadiaMalik',
  'Dr. Hassan Farooq': 'drHassanFarooq',
};

/** Maps exact `doctors.specialty` from seed data → `findDoctor.specialtyLabels.*` slug */
export const SPECIALTY_DB_TO_SLUG: Record<string, string> = {
  'General Medicine': 'generalMedicine',
  Cardiology: 'cardiology',
  Dermatology: 'dermatology',
  Orthopedics: 'orthopedics',
  Pediatrics: 'pediatrics',
  Neurology: 'neurology',
  Gynecology: 'gynecology',
  Ophthalmology: 'ophthalmology',
  Psychiatry: 'psychiatry',
  Gastroenterology: 'gastroenterology',
  Endocrinology: 'endocrinology',
  Pulmonology: 'pulmonology',
  Rheumatology: 'rheumatology',
  Urology: 'urology',
  'Allergy & Immunology': 'allergyImmunology',
  Oncology: 'oncology',
};

/** Maps filter `<option value>` → same slug as SPECIALTY_DB_TO_SLUG */
export const SPECIALTY_FILTER_VALUE_TO_SLUG: Record<string, string | null> = {
  all: null,
  Cardiologist: 'cardiology',
  Pediatrician: 'pediatrics',
  Dermatologist: 'dermatology',
  'Orthopedic Surgeon': 'orthopedics',
  'General Practitioner': 'generalMedicine',
  Neurologist: 'neurology',
  Gynecologist: 'gynecology',
  Ophthalmologist: 'ophthalmology',
  Psychiatrist: 'psychiatry',
  Endocrinologist: 'endocrinology',
};

/** Maps exact `doctors.location` from seed data → `findDoctor.locationLabels.*` key */
export const LOCATION_DB_TO_SLUG: Record<string, string> = {
  'Dubai Healthcare City': 'dubaiHealthcareCity',
  'Al Zahra Hospital': 'alZahraHospital',
  'Mediclinic City Hospital': 'mediclinicCityHospital',
  'NMC Royal Hospital': 'nmcRoyalHospital',
  'Aster Hospital': 'asterHospital',
  'Mediclinic Parkview': 'mediclinicParkview',
  'Burjeel Hospital': 'burjeelHospital',
  'Moorfields Eye Hospital': 'moorfieldsEyeHospital',
  'American Hospital Dubai': 'americanHospitalDubai',
  'Emirates Hospital': 'emiratesHospital',
  'Saudi German Hospital': 'saudiGermanHospital',
  'Rashid Hospital': 'rashidHospital',
  'Cleveland Clinic Abu Dhabi': 'clevelandClinicAbuDhabi',
  'Zulekha Hospital': 'zulekhaHospital',
  'Prime Hospital': 'primeHospital',
};

export const displayDoctorDirectoryName = (t: TFunction, name: string): string => {
  const leaf = DOCTOR_DISPLAY_NAME_KEY[name];
  if (!leaf) return name;
  const key = `findDoctor.displayNames.${leaf}`;
  const out = t(key);
  return out === key ? name : out;
};

export const displayDoctorDirectorySpecialty = (t: TFunction, specialty: string): string => {
  const leaf = SPECIALTY_DB_TO_SLUG[specialty];
  if (!leaf) return specialty;
  const key = `findDoctor.specialtyLabels.${leaf}`;
  const out = t(key);
  return out === key ? specialty : out;
};

export const displayDoctorDirectoryLocation = (t: TFunction, location: string): string => {
  const leaf = LOCATION_DB_TO_SLUG[location];
  if (!leaf) return location;
  const key = `findDoctor.locationLabels.${leaf}`;
  const out = t(key);
  return out === key ? location : out;
};

/** Lowercased blob for search: raw + localized strings */
export const findDoctorSearchHaystack = (
  t: TFunction,
  row: { name: string; specialty: string; location: string }
): string =>
  [
    row.name,
    row.specialty,
    row.location,
    displayDoctorDirectoryName(t, row.name),
    displayDoctorDirectorySpecialty(t, row.specialty),
    displayDoctorDirectoryLocation(t, row.location),
  ]
    .join(' ')
    .toLowerCase();

export const matchesDirectorySpecialtyFilter = (
  doctorSpecialty: string,
  selectedFilterValue: string
): boolean => {
  if (selectedFilterValue === 'all') return true;
  const doctorSlug = SPECIALTY_DB_TO_SLUG[doctorSpecialty];
  const filterSlug = SPECIALTY_FILTER_VALUE_TO_SLUG[selectedFilterValue];
  if (doctorSlug && filterSlug) return doctorSlug === filterSlug;
  return doctorSpecialty.toLowerCase().includes(selectedFilterValue.toLowerCase());
};

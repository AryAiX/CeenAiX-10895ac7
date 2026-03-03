import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Search, ArrowLeft, MapPin, Star, Clock, Phone,
  Filter, X, Building2, Users, Calendar, Mail,
  Stethoscope, ChevronDown, ChevronUp,
  CheckCircle2, Ambulance, ParkingCircle, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  image_url: string;
  rating: number;
  total_reviews: number;
  description: string;
  facilities: string[];
  specialties: string[];
  emergency_services: boolean;
  parking_available: boolean;
  insurance_accepted: string[];
  operating_hours: Record<string, string>;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image_url: string;
  experience_years: number;
  is_available: boolean;
  consultation_days: string[];
  consultation_hours: string;
  room_number: string;
}

export const FindClinic: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<Record<string, Doctor[]>>({});
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalDoctors = async (hospitalId: string) => {
    if (hospitalDoctors[hospitalId]) return;

    try {
      const { data, error } = await supabase
        .from('hospital_doctors')
        .select(`
          *,
          doctor:doctors (
            id,
            name,
            specialization,
            image_url,
            experience_years
          )
        `)
        .eq('hospital_id', hospitalId);

      if (error) throw error;

      const doctors = data?.map(hd => ({
        id: hd.doctor.id,
        name: hd.doctor.name,
        specialization: hd.doctor.specialization,
        image_url: hd.doctor.image_url,
        experience_years: hd.doctor.experience_years,
        is_available: hd.is_available,
        consultation_days: hd.consultation_days || [],
        consultation_hours: hd.consultation_hours || '',
        room_number: hd.room_number || ''
      })) || [];

      setHospitalDoctors(prev => ({ ...prev, [hospitalId]: doctors }));
    } catch (error) {
      console.error('Error fetching hospital doctors:', error);
    }
  };

  const toggleHospitalExpansion = (hospitalId: string) => {
    if (expandedHospital === hospitalId) {
      setExpandedHospital(null);
    } else {
      setExpandedHospital(hospitalId);
      fetchHospitalDoctors(hospitalId);
    }
  };

  const allCities = Array.from(new Set(hospitals.map(h => h.city)));
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap(h => h.specialties || []))
  ).sort();

  const filteredHospitals = hospitals
    .filter(hospital => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || hospital.type === selectedType;
      const matchesCity = selectedCity === 'all' || hospital.city === selectedCity;
      const matchesSpecialty = selectedSpecialty === 'all' ||
        hospital.specialties?.includes(selectedSpecialty);
      const matchesEmergency = !showEmergencyOnly || hospital.emergency_services;

      return matchesSearch && matchesType && matchesCity && matchesSpecialty && matchesEmergency;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Building2 className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Healthcare Facilities
              </span>
            </div>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Find Hospitals & Clinics
          </h1>
          <p className="text-lg text-gray-600">
            Discover top-rated healthcare facilities with experienced doctors near you
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Hospitals & Clinics
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location, or specialty..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:self-end px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="hospital">Hospitals</option>
                  <option value="clinic">Clinics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cities</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specialties</option>
                  {allSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmergencyOnly}
                    onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    24/7 Emergency Only
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Found {filteredHospitals.length} {filteredHospitals.length === 1 ? 'facility' : 'facilities'}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading facilities...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-80 h-64 md:h-auto">
                    <img
                      src={hospital.image_url}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {hospital.name}
                          </h3>
                          {hospital.type === 'hospital' ? (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Heart className="w-5 h-5 text-cyan-600" />
                          )}
                        </div>
                        <p className="text-blue-600 font-medium capitalize">{hospital.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {hospital.emergency_services && (
                          <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <Ambulance className="w-3.5 h-3.5" />
                            24/7 Emergency
                          </span>
                        )}
                        {hospital.parking_available && (
                          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                            <ParkingCircle className="w-3.5 h-3.5" />
                            Parking
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{hospital.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">{hospital.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <a href={`tel:${hospital.phone}`} className="text-sm hover:text-blue-600">
                          {hospital.phone}
                        </a>
                      </div>
                      {hospital.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <a href={`mailto:${hospital.email}`} className="text-sm hover:text-blue-600">
                            {hospital.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" />
                        <span className="font-bold text-gray-900">{hospital.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({hospital.total_reviews} reviews)</span>
                      </div>
                    </div>

                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.slice(0, 6).map((specialty, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              {specialty}
                            </span>
                          ))}
                          {hospital.specialties.length > 6 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{hospital.specialties.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          Insurance Accepted
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.insurance_accepted.slice(0, 4).map((insurance, index) => (
                            <span
                              key={index}
                              className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {insurance}
                            </span>
                          ))}
                          {hospital.insurance_accepted.length > 4 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{hospital.insurance_accepted.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleHospitalExpansion(hospital.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <Users className="w-4 h-4" />
                        {expandedHospital === hospital.id ? 'Hide' : 'View'} Doctors
                        {expandedHospital === hospital.id ?
                          <ChevronUp className="w-4 h-4" /> :
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => navigate('/patient/appointments')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>

                {expandedHospital === hospital.id && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-t border-gray-200 p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      Available Doctors at {hospital.name}
                    </h4>

                    {hospitalDoctors[hospital.id]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hospitalDoctors[hospital.id].map((doctor) => (
                          <div
                            key={doctor.id}
                            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <img
                                src={doctor.image_url}
                                alt={doctor.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 mb-1">{doctor.name}</h5>
                                <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {doctor.experience_years}+ years experience
                                </p>
                              </div>
                              {doctor.is_available ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                  Available
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                                  Unavailable
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>Room {doctor.room_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{doctor.consultation_hours}</span>
                              </div>
                              {doctor.consultation_days?.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex flex-wrap gap-1">
                                    {doctor.consultation_days.map((day, idx) => (
                                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                        {day}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => navigate('/patient/appointments')}
                              className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                              Book with Dr. {doctor.name.split(' ')[doctor.name.split(' ').length - 1]}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Loading doctors...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredHospitals.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No facilities found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

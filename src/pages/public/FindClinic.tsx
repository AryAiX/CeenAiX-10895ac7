import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Clock, Phone,
  Filter, Building2, Users, Calendar, Mail,
  ChevronDown, ChevronUp,
  Ambulance, ParkingCircle, Shield, Navigation,
  Award, TrendingUp, Stethoscope, Heart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Header } from '../../components/Header';
import { BookingModal } from '../../components/BookingModal';

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
  latitude: number;
  longitude: number;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  image_url: string;
  average_rating: number;
  total_ratings: number;
  accepts_video: boolean;
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
  const [minRating, setMinRating] = useState<number>(0);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<Record<string, Doctor[]>>({});
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const [showNavMenu, setShowNavMenu] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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
            specialty,
            location,
            image_url,
            average_rating,
            total_ratings,
            accepts_video
          )
        `)
        .eq('hospital_id', hospitalId);

      if (error) throw error;

      const doctors = data?.map(hd => ({
        id: hd.doctor.id,
        name: hd.doctor.name,
        specialty: hd.doctor.specialty,
        location: hd.doctor.location,
        image_url: hd.doctor.image_url,
        average_rating: hd.doctor.average_rating || 0,
        total_ratings: hd.doctor.total_ratings || 0,
        accepts_video: hd.doctor.accepts_video,
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

  const openGoogleMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
    setShowNavMenu(null);
  };

  const openWaze = (hospital: Hospital) => {
    const url = `https://waze.com/ul?ll=${hospital.latitude},${hospital.longitude}&navigate=yes`;
    window.open(url, '_blank');
    setShowNavMenu(null);
  };

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
      const matchesRating = hospital.rating >= minRating;

      return matchesSearch && matchesType && matchesCity && matchesSpecialty && matchesEmergency && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Modern hospital"
          className="w-full h-96 object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Find Healthcare Facilities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated hospitals and clinics with experienced doctors near you
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 transform hover:shadow-2xl transition-all">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Hospitals & Clinics
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
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
              className="md:self-end px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Rating: {minRating === 0 ? 'All' : `${minRating}+ Stars`}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex items-center gap-1 min-w-[120px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 transition-all ${
                            star <= minRating
                              ? 'text-yellow-500 fill-current scale-110'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showEmergencyOnly}
                      onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      24/7 Emergency Only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Found <span className="font-bold text-blue-600">{filteredHospitals.length}</span> {filteredHospitals.length === 1 ? 'facility' : 'facilities'}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading facilities...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="lg:flex">
                  <div className="lg:w-96 h-72 lg:h-auto relative overflow-hidden group">
                    <img
                      src={hospital.image_url}
                      alt={hospital.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {hospital.rating >= 4.5 && (
                      <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce-subtle">
                        <Award className="w-3.5 h-3.5" />
                        Top Rated
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            {hospital.name}
                          </h3>
                          {hospital.type === 'hospital' ? (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Heart className="w-5 h-5 text-cyan-600" />
                          )}
                        </div>
                        <p className="text-blue-600 font-medium capitalize flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                          {hospital.type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {hospital.emergency_services && (
                          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md animate-pulse-subtle">
                            <Ambulance className="w-3.5 h-3.5" />
                            24/7 Emergency
                          </span>
                        )}
                        {hospital.parking_available && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                            <ParkingCircle className="w-3.5 h-3.5" />
                            Parking
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{hospital.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700 group hover:text-blue-600 transition-colors">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 group-hover:animate-bounce-subtle" />
                        <span className="text-sm">{hospital.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 group hover:text-blue-600 transition-colors">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 group-hover:animate-bounce-subtle" />
                        <a href={`tel:${hospital.phone}`} className="text-sm hover:text-blue-600">
                          {hospital.phone}
                        </a>
                      </div>
                      {hospital.email && (
                        <div className="flex items-center gap-2 text-gray-700 group hover:text-blue-600 transition-colors">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 group-hover:animate-bounce-subtle" />
                          <a href={`mailto:${hospital.email}`} className="text-sm hover:text-blue-600">
                            {hospital.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 animate-pulse-subtle" />
                        <span className="font-bold text-gray-900">{hospital.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({hospital.total_reviews} reviews)</span>
                      </div>
                    </div>

                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          Specialties
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.slice(0, 6).map((specialty, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:scale-105 transition-transform cursor-default"
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
                      <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <p className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Insurance Accepted ({hospital.insurance_accepted.length} providers)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.insurance_accepted.map((insurance, index) => (
                            <span
                              key={index}
                              className="bg-white border-2 border-green-300 text-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default"
                            >
                              {insurance}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleHospitalExpansion(hospital.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-xl transform hover:scale-105"
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
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-md"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowNavMenu(showNavMenu === hospital.id ? null : hospital.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-xl transform hover:scale-105"
                        >
                          <Navigation className="w-4 h-4" />
                          Get Directions
                          <ChevronDown className={`w-4 h-4 transition-transform ${showNavMenu === hospital.id ? 'rotate-180' : ''}`} />
                        </button>
                        {showNavMenu === hospital.id && (
                          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10 animate-fade-in min-w-[200px]">
                            <button
                              onClick={() => openGoogleMaps(hospital)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left text-gray-700 hover:text-blue-600 font-medium"
                            >
                              <MapPin className="w-4 h-4 text-blue-600" />
                              Google Maps
                            </button>
                            <button
                              onClick={() => openWaze(hospital)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 transition-colors text-left text-gray-700 hover:text-cyan-600 font-medium border-t border-gray-100"
                            >
                              <Navigation className="w-4 h-4 text-cyan-600" />
                              Waze
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedHospital === hospital.id && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-t-2 border-blue-100 p-6 animate-fade-in">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      Available Doctors at {hospital.name}
                    </h4>

                    {hospitalDoctors[hospital.id]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hospitalDoctors[hospital.id].map((doctor, idx) => (
                          <div
                            key={doctor.id}
                            className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="relative">
                                <img
                                  src={doctor.image_url}
                                  alt={doctor.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                                />
                                {doctor.is_available && (
                                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 mb-1">{doctor.name}</h5>
                                <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                  <span className="text-xs font-bold text-gray-900">
                                    {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}
                                  </span>
                                  {doctor.total_ratings > 0 && (
                                    <span className="text-xs text-gray-500">({doctor.total_ratings})</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
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
                                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                        {day}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowBookingModal(true);
                              }}
                              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              Book with Dr. {doctor.name.split(' ')[doctor.name.split(' ').length - 1]}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p>Loading doctors...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredHospitals.length === 0 && (
              <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No facilities found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                  alt="CeenAiX Logo"
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-white">CeenAiX</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Secure healthcare platform with AI-powered insights
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/find-doctor')} className="hover:text-ceenai-cyan transition-colors">Find Doctors</button></li>
                <li><button onClick={() => navigate('/find-clinic')} className="hover:text-ceenai-cyan transition-colors">Find Clinics</button></li>
                <li><button onClick={() => navigate('/ai-chat')} className="hover:text-ceenai-cyan transition-colors">AI Health Chat</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/health-education')} className="hover:text-ceenai-cyan transition-colors">Health Education</button></li>
                <li><button onClick={() => navigate('/insurance')} className="hover:text-ceenai-cyan transition-colors">Insurance</button></li>
                <li><a href="#" className="hover:text-ceenai-cyan transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@ceenaix.com</li>
                <li>1-800-CEENAIX</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">© 2026 CeenAiX. DHA-compliant healthcare technology. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onBookingComplete={() => {
            fetchHospitals();
          }}
        />
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-line {
          animation: draw-line 4s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

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
import { Footer } from '../../components/Footer';
import { Skeleton } from '../../components/Skeleton';

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
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
        <div className="absolute bottom-0 right-1/2 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
            <Building2 className="h-4 w-4" />
            <span>Facility discovery</span>
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-ceenai-blue to-ceenai-cyan bg-clip-text text-5xl font-bold text-transparent">
            Find Healthcare Facilities
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Discover top-rated hospitals and clinics with experienced doctors near you
          </p>
        </div>

        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur transition-all">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search Hospitals & Clinics
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-ceenai-blue" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location, or specialty..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:self-end rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 font-medium text-slate-700 transition-all hover:bg-slate-100"
            >
              <span className="inline-flex items-center gap-2">
                <Filter className="h-5 w-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 space-y-4 border-t border-slate-200 pt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
                  >
                    <option value="all">All Types</option>
                    <option value="hospital">Hospitals</option>
                    <option value="clinic">Clinics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
                  >
                    <option value="all">All Cities</option>
                    {allCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specialty</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
                  >
                    <option value="all">All Specialties</option>
                    {allSpecialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      className="flex-1 h-2 appearance-none rounded-lg bg-slate-200 accent-ceenai-blue cursor-pointer"
                    />
                    <div className="flex items-center gap-1 min-w-[120px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 transition-all ${
                            star <= minRating
                              ? 'text-yellow-500 fill-current scale-110'
                              : 'text-slate-300'
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
                      className="h-5 w-5 rounded border-slate-300 text-ceenai-blue focus:ring-ceenai-blue"
                    />
                    <span className="ml-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-ceenai-blue">
                      24/7 Emergency Only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <TrendingUp className="w-4 h-4 text-ceenai-blue" />
          Found <span className="font-bold text-ceenai-blue">{filteredHospitals.length}</span> {filteredHospitals.length === 1 ? 'facility' : 'facilities'}
        </div>

        {loading ? (
          <div className="space-y-4 py-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
                  <Skeleton className="h-72 w-full rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-9 w-full rounded-lg" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Skeleton className="h-10 w-40 rounded-lg" />
                      <Skeleton className="h-10 w-44 rounded-lg" />
                      <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-slate-500">Loading facilities...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className="card-hover animate-fade-in-up overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm"
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
                          <h3 className="text-2xl font-bold text-slate-900 transition-colors hover:text-ceenai-blue">
                            {hospital.name}
                          </h3>
                          {hospital.type === 'hospital' ? (
                            <Building2 className="w-5 h-5 text-ceenai-blue" />
                          ) : (
                            <Heart className="w-5 h-5 text-ceenai-cyan" />
                          )}
                        </div>
                        <p className="flex items-center gap-2 font-medium capitalize text-ceenai-blue">
                          <span className="h-2 w-2 rounded-full bg-ceenai-blue animate-pulse"></span>
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

                    <p className="mb-4 line-clamp-2 leading-relaxed text-slate-600">{hospital.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="group flex items-center gap-2 text-slate-700 transition-colors hover:text-ceenai-blue">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-ceenai-blue group-hover:animate-bounce-subtle" />
                        <span className="text-sm">{hospital.address}</span>
                      </div>
                      <div className="group flex items-center gap-2 text-slate-700 transition-colors hover:text-ceenai-blue">
                        <Phone className="h-4 w-4 flex-shrink-0 text-ceenai-blue group-hover:animate-bounce-subtle" />
                        <a href={`tel:${hospital.phone}`} className="text-sm hover:text-ceenai-blue">
                          {hospital.phone}
                        </a>
                      </div>
                      {hospital.email && (
                        <div className="group flex items-center gap-2 text-slate-700 transition-colors hover:text-ceenai-blue">
                          <Mail className="h-4 w-4 flex-shrink-0 text-ceenai-blue group-hover:animate-bounce-subtle" />
                          <a href={`mailto:${hospital.email}`} className="text-sm hover:text-ceenai-blue">
                            {hospital.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                        <Star className="h-5 w-5 flex-shrink-0 fill-current text-yellow-500 animate-pulse-subtle" />
                        <span className="font-bold text-slate-900">{hospital.rating.toFixed(1)}</span>
                        <span className="text-sm text-slate-500">({hospital.total_reviews} reviews)</span>
                      </div>
                    </div>

                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                          <Stethoscope className="h-3.5 w-3.5 text-ceenai-blue" />
                          Specialties
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.slice(0, 6).map((specialty, index) => (
                            <span
                              key={index}
                              className="cursor-default rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition-transform hover:scale-105"
                            >
                              {specialty}
                            </span>
                          ))}
                          {hospital.specialties.length > 6 && (
                            <span className="px-2 py-1 text-xs text-slate-500">
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

                    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                      <button
                        onClick={() => toggleHospitalExpansion(hospital.id)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-ceenai-blue to-ceenai-cyan px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-xl"
                      >
                        <Users className="w-4 h-4" />
                        {expandedHospital === hospital.id ? 'Hide' : 'View'} Doctors
                        {expandedHospital === hospital.id ?
                          <ChevronUp className="w-4 h-4" /> :
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => navigate('/auth/register?role=patient&reset=1')}
                        className="flex items-center gap-2 rounded-lg border-2 border-ceenai-blue bg-white px-5 py-2.5 font-semibold text-ceenai-blue transition-all hover:scale-105 hover:bg-cyan-50 hover:shadow-md"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowNavMenu(showNavMenu === hospital.id ? null : hospital.id)}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
                        >
                          <Navigation className="w-4 h-4" />
                          Get Directions
                          <ChevronDown className={`w-4 h-4 transition-transform ${showNavMenu === hospital.id ? 'rotate-180' : ''}`} />
                        </button>
                        {showNavMenu === hospital.id && (
                          <div className="absolute left-0 top-full z-10 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl animate-fade-in">
                            <button
                              onClick={() => openGoogleMaps(hospital)}
                              className="w-full text-left text-slate-700 flex items-center gap-3 px-4 py-3 font-medium transition-colors hover:bg-cyan-50 hover:text-ceenai-blue"
                            >
                              <MapPin className="h-4 w-4 text-ceenai-blue" />
                              Google Maps
                            </button>
                            <button
                              onClick={() => openWaze(hospital)}
                              className="w-full text-left text-slate-700 flex items-center gap-3 border-t border-slate-100 px-4 py-3 font-medium transition-colors hover:bg-cyan-50 hover:text-ceenai-cyan"
                            >
                              <Navigation className="h-4 w-4 text-ceenai-cyan" />
                              Waze
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedHospital === hospital.id && (
                  <div className="animate-fade-in border-t-2 border-cyan-100 bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
                    <h4 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Stethoscope className="h-5 w-5 text-ceenai-blue" />
                      Available Doctors at {hospital.name}
                    </h4>

                    {hospitalDoctors[hospital.id]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hospitalDoctors[hospital.id].map((doctor, idx) => (
                          <div
                            key={doctor.id}
                            className="card-hover animate-fade-in-up rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
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
                                <h5 className="mb-1 font-bold text-slate-900">{doctor.name}</h5>
                                <p className="text-sm font-medium text-ceenai-blue">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                  <span className="text-xs font-bold text-slate-900">
                                    {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}
                                  </span>
                                  {doctor.total_ratings > 0 && (
                                    <span className="text-xs text-slate-500">({doctor.total_ratings})</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-3 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                <span>Room {doctor.room_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                <span>{doctor.consultation_hours}</span>
                              </div>
                              {doctor.consultation_days?.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                  <div className="flex flex-wrap gap-1">
                                    {doctor.consultation_days.map((day, idx) => (
                                      <span key={idx} className="rounded bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
                                        {day}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => navigate('/patient/appointments/book')}
                              className="w-full rounded-lg bg-gradient-to-r from-ceenai-blue to-ceenai-cyan px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                            >
                              Book with Dr. {doctor.name.split(' ')[doctor.name.split(' ').length - 1]}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <div className="space-y-2">
                          <Skeleton className="mx-auto h-4 w-48" />
                          <Skeleton className="mx-auto h-4 w-36" />
                        </div>
                        <p className="mt-3">Loading doctors...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredHospitals.length === 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 py-16 text-center shadow-sm backdrop-blur-sm">
                <Building2 className="mx-auto mb-4 h-16 w-16 animate-pulse text-slate-300" />
                <h3 className="mb-2 text-xl font-semibold text-slate-900">No facilities found</h3>
                <p className="text-slate-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

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
